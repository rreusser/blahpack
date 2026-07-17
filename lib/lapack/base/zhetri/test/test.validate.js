/**
* Property-based validation for zhetri, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> HERMITIAN dense
* (schemes.dense, logical.hermitian — A(j,i)=conj(A(i,j)), real diagonal); `tri`
* (inverse from a Bunch-Kaufman LDL^H factor) -> RECONSTRUCTION: A0 * inv(A0) = I.
* Input is the Bunch-Kaufman factor + IPIV (produced by calling zhetrf in place);
* output overwrites the uplo triangle with inv(A), which is Hermitian — the
* opposite triangle is NOT referenced. The FULL Hermitian logical matrix A0 is
* the independent oracle; the product of the original with the computed inverse
* must be the identity, at backward-error tolerance.
*/

import test from 'node:test';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zhetri from './../lib/ndarray.js';
import zhetrf from '../../zhetrf/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NB = 32; // block size hardcoded in zhetrf/lib/base.js

// Read the computed inverse (stored in the uplo triangle) back into a FULL
// HERMITIAN LogicalMatrix by CONJUGATE-mirroring the referenced triangle across
// the diagonal (the diagonal is its own mirror and should be real).
function readHermFull( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var v;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, i, R.read( i, i ) );
			} else if ( uplo === 'upper' ) {
				v = R.read( j, i ); // referenced upper element
				F.set( j, i, v );
				F.set( i, j, sc.conj( v ) ); // Hermitian mirror
			} else {
				v = R.read( i, j ); // referenced lower element
				F.set( i, j, v );
				F.set( j, i, sc.conj( v ) );
			}
		}
	}
	return F;
}

// Read only the referenced uplo triangle back (opposite triangle exact zero) for
// bit-exact layout-invariance flattening.
function readTri( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Freeze the factored uplo triangle into a full LogicalMatrix so it can be
// RE-REALIZED at another layout for the layout-invariance test.
function factorLogical( R, n, uplo ) {
	return readTri( R, n, uplo );
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + √n, recovering the backward-stable ~n·eps quantity even when
// the (indefinite) A0 is moderately ill-conditioned.
function assertInvResidual( A0, invA, P, n, label, factor ) {
	var R = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB read into poisoned storage
	var scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// flags, and every PIVOT-VALID storage layout. SIZES_SMALL spans the unblocked
// and blocked (N=33,64) paths. zhetrf does an izamax pivot search over a column,
// so a negative first-dimension (row) stride is out of contract (see LEARNINGS
// getrf/getf2 family) — hence pivotLayouts, which still exercise col AND row
// order, padded leading dims, gaps, and negative COLUMN stride. At backward-error
// tolerance this certifies cross-storage-order addressing of BOTH factor and
// inverse.
test( 'zhetri: inverse reconstruction A*inv(A)=I (size sweep x uplo x pivot layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
				runReconstruct( uplo, n, layout );
			});
		});
	});
});

function runReconstruct( uplo, n, layout ) {
	var rng = new RNG( 0x100 + n ); // reproducible; log on failure
	var A0 = logical.hermitian( sc, rng, n );
	var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var ipiv = new Int32Array( Math.max( n, 1 ) );
	var lwork = Math.max( n, 1 ) * NB;
	var factorWork = new Complex128Array( lwork );
	var work = poisonedWork( sc, Math.max( n, 1 ) ); // poisoned complex scratch (len N)

	var info = zhetrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, factorWork, 1, 0, lwork );
	if ( info !== 0 ) {
		return; // rare singular draw — inverse undefined
	}
	info = zhetri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
	if ( info !== 0 ) {
		return;
	}
	var invA = readHermFull( R, n, uplo );
	var P = ref.matmul( sc, A0, invA );
	checked( 'zhetri', 'reconstruct', function run() {
		assertInvResidual( A0, invA, P, n, 'zhetri '+uplo+' n='+n, 100 );
	});
}

// Step 4: layout-invariance fuzz on zhetri's OWN addressing. zhetrf makes DISCRETE
// Bunch-Kaufman pivot choices that can flip on a last-ULP layout change (see
// LEARNINGS zhetrf pivot-flip entry), so to isolate the INVERSE kernel we
// pre-factor ONCE at a tight col-major layout, freeze the factor values + IPIV,
// then re-realize that fixed factor at each layout and run only zhetri. Even so,
// the unblocked inverse kernel bottoms out in reference-BLAS unit-stride fast
// paths (zdotc/zhemv/zcopy) whose summation order shifts ~1 ULP with stride sign
// / gap / storage order (cf. the dpotri/dpptri LEARNINGS entry). So bit-equality
// is asserted across a PURE-ADDRESSING family only: tight col-major, g=1,
// positive strides, varying ONLY base offset, leading pad, and leading-dim
// padding — which cannot change arithmetic order, so any residual difference is a
// genuine addressing bug. Cross-order/sign/gap correctness is covered by the
// reconstruction sweep above. Records L3 honestly.
var PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 11, 'tail': 0 }
];
var TIGHT_COL = PURE_ADDR[ 0 ];

test( 'zhetri: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, 40 );
	});
});

function runInvariance( uplo, n ) {
	var SEED = 0xF00D;

	// Pre-factor ONCE at a tight col-major layout and freeze the factor + IPIV:
	var rng = new RNG( SEED );
	var A0 = logical.hermitian( sc, rng, n );
	var Rf = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT_COL );
	var ipiv0 = new Int32Array( n );
	var lwork = n * NB;
	var factorWork = new Complex128Array( lwork );
	var info = zhetrf( uplo, n, Rf.data, Rf.args[ 0 ], Rf.args[ 1 ], Rf.args[ 2 ], ipiv0, 1, 0, factorWork, 1, 0, lwork );
	if ( info !== 0 ) {
		throw new Error( 'zhetri invariance setup: zhetrf returned info='+info+' (singular factor)' );
	}
	var Ffac = factorLogical( Rf, n, uplo ); // frozen factor in the uplo triangle

	checked( 'zhetri', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			var R = schemes.dense.realize( sc, Ffac, { 'part': uplo }, layout );
			var ipiv = ipiv0.slice();
			var work = poisonedWork( sc, n );
			var code = zhetri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			if ( code !== 0 ) {
				throw new Error( 'zhetri returned info='+code );
			}
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zhetri '+uplo+' n='+n+' pure-addressing layout invariance' } );
	});
}

// Step 4c: workspace conformance. zhetri's WORK is a fixed-size (len N complex)
// unblocked scratch column advertised by the ndarray wrapper (throws below N).
// Probe the smallest accepted length and assert it suffices with a POISONED
// buffer (read-before-write / over-read would surface as NaN in the inverse).
test( 'zhetri: workspace minimum (len N) suffices with a poisoned buffer', function t() {
	var uplo = 'upper';
	var N = 33;
	var SEED = 0xC0FFEE;

	var rng = new RNG( SEED );
	var A0 = logical.hermitian( sc, rng, N );
	var Rf = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT_COL );
	var ipiv0 = new Int32Array( N );
	var lwork = N * NB;
	var factorWork = new Complex128Array( lwork );
	var info = zhetrf( uplo, N, Rf.data, Rf.args[ 0 ], Rf.args[ 1 ], Rf.args[ 2 ], ipiv0, 1, 0, factorWork, 1, 0, lwork );
	if ( info !== 0 ) {
		throw new Error( 'zhetri workspace setup: zhetrf info='+info );
	}
	var Ffac = factorLogical( Rf, N, uplo );

	function run( workLen ) {
		var R = schemes.dense.realize( sc, Ffac, { 'part': uplo }, TIGHT_COL );
		var ipiv = ipiv0.slice();
		var work = poisonedWork( sc, workLen );
		zhetri( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
		return check.flattenLogical( sc, readTri( R, N, uplo ) );
	}

	checked( 'zhetri', 'workspace', function check_() {
		var minLen = assertWorkspaceSufficient( run, {}, 'zhetri WORK@N=33 upper' );
		if ( minLen !== N ) {
			throw new Error( 'zhetri: advertised WORK minimum '+minLen+' != N='+N );
		}
	});
});
