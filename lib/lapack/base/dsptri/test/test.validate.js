/**
* Property-based validation for dsptri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sp` -> symmetric PACKED
* (schemes.packed, logical.symmetric — dsptri is COMPLEX-SYMMETRIC, so the real
* analogue is a plain symmetric matrix, NOT Hermitian); `tri` (inverse from a
* packed Bunch-Kaufman factor) -> RECONSTRUCTION: A0 * inv(A0) = I. Input is the
* packed Bunch-Kaufman factor + IPIV (produced by calling dsptrf in place); output
* overwrites the packed uplo triangle with inv(A), which is symmetric — the
* opposite triangle is NOT stored. The FULL symmetric logical matrix A0 is the
* independent oracle; the product of the original with the computed inverse must
* be the identity, at backward-error tolerance.
*
* Because the Bunch-Kaufman FACTOR (dsptrf) does an idamax pivot search over a
* packed column (stride = strideAP), a negative packed stride is out of contract
* for the factor (idamax returns -1; see LEARNINGS getrf/getf2 family). So — as
* for the dense dsytri — the factor is produced ONCE at a tight layout and only
* the INVERSE (dsptri) is re-run across the full packed-layout set (including
* non-unit and negative packed strides). That still stresses dsptri's OWN packed
* addressing at every stride, which is the class the zpptri packed stride-mapping
* bug (offset+idx vs offset+idx*stride) lives in.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dsptri from './../lib/ndarray.js';
import dsptrf from '../../dsptrf/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (packed uplo triangle) back into a FULL symmetric
// LogicalMatrix by mirroring the referenced triangle across the diagonal. dsptri
// is COMPLEX-SYMMETRIC (no conjugation on the mirror); for a real scalar sc.conj
// is the identity, so this is a plain symmetric mirror.
function readSymFull( R, n, uplo ) {
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
				F.set( i, j, v ); // symmetric mirror (no conj)
			} else {
				v = R.read( i, j ); // referenced lower element
				F.set( i, j, v );
				F.set( j, i, v );
			}
		}
	}
	return F;
}

// Read only the referenced packed uplo triangle back (opposite triangle exact
// zero) for bit-exact layout-invariance flattening AND for freezing the factor.
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

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + √n (NOT ‖I‖ alone), recovering the backward-stable ~n·eps
// quantity even when the (indefinite) A0 is moderately ill-conditioned.
function assertInvResidual( A0, invA, P, n, label, factor ) {
	var R = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB / packed-stride bug
	var scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Freeze a Bunch-Kaufman factor for a given (uplo,n): factor A0 ONCE at a tight
// packed layout and return the frozen factor triangle + IPIV, so the inverse can
// be re-run at arbitrary packed layouts without re-invoking the (idamax-bound)
// factor. Returns null on a rare singular draw.
var TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };

function freezeFactor( n, seed ) {
	var rng = new RNG( seed );
	var A0 = logical.symmetric( sc, rng, n );
	var UPLO = [ 'upper', 'lower' ];
	var out = {};
	var i;
	for ( i = 0; i < UPLO.length; i++ ) {
		out[ UPLO[ i ] ] = factorOne( A0, n, UPLO[ i ] );
		if ( out[ UPLO[ i ] ] === null ) {
			return null;
		}
	}
	out.A0 = A0;
	return out;
}

function factorOne( A0, n, uplo ) {
	var R = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	var ipiv = new Int32Array( Math.max( n, 1 ) );
	var info = dsptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0 );
	if ( info !== 0 ) {
		return null; // rare singular draw
	}
	return {
		'factor': readTri( R, n, uplo ),
		'ipiv': ipiv
	};
}

// Run ONLY the inverse from a frozen factor at a given packed layout; returns the
// realized packed buffer wrapper R so the caller can read the inverse back.
function invertAt( F, n, uplo, layout ) {
	var R = schemes.packed.realize( sc, F.factor, { 'part': uplo }, layout );
	var ipiv = F.ipiv.slice();
	var work = poisonedWork( sc, Math.max( n, 1 ) );
	var info = dsptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0, work, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'dsptri returned info='+info+' from a nonsingular frozen factor' );
	}
	return R;
}

// Steps 2-3-5: reconstruction A0*inv(A0)=I across the size sweep, both uplo flags,
// and EVERY packed storage layout (non-unit strides 2/3, negative strides −1/−2,
// leading/trailing pads). The factor is frozen at a tight layout; only dsptri runs
// per layout, so this certifies dsptri's own packed addressing across all strides
// at backward-error tolerance — the packed-stride NaN/garbage detector.
test( 'dsptri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all packed layouts)', function t() {
	SIZES_SMALL.forEach( function eachN( n ) {
		var F = freezeFactor( n, 0x100 + n );
		if ( F === null ) {
			return; // rare singular draw — inverse undefined
		}
		UPLOS.forEach( function eachUplo( uplo ) {
			schemes.packed.layouts().forEach( function eachLayout( layout ) {
				var R = invertAt( F[ uplo ], n, uplo, layout );
				var invA = readSymFull( R, n, uplo );
				var P = ref.matmul( sc, F.A0, invA );
				checked( 'dsptri', 'reconstruct', function run() {
					assertInvResidual( F.A0, invA, P, n, 'dsptri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz on dsptri's OWN addressing. dsptri's unblocked
// kernel bottoms out in reference-BLAS packed fast paths (ddot / dspmv / dcopy)
// whose summation order shifts ~1 ULP with packed stride magnitude / sign (see the
// dpotri/dpptri LEARNINGS entry, which names dsptri). So bit-equality is asserted
// across a PURE-ADDRESSING family only: fixed unit packed stride, varying ONLY the
// base offset (lead) and trailing pad — which cannot change arithmetic order, so
// any residual difference is a genuine offset/base addressing bug. Cross-stride
// correctness (incl. non-unit and negative) is certified by the reconstruction
// sweep above. Records L3 honestly.
var PURE_ADDR = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 7, 'tail': 4 },
	{ 'stride': 1, 'lead': 1, 'tail': 5 }
];

test( 'dsptri: bit-exact across pure-addressing packed layouts (offset)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 9, 40 ].forEach( function eachN( n ) {
			runInvariance( uplo, n );
		});
	});
});

function runInvariance( uplo, n ) {
	var F = freezeFactor( n, 0xF00D );
	if ( F === null ) {
		throw new Error( 'dsptri invariance setup: dsptrf returned a singular factor' );
	}
	checked( 'dsptri', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			var R = invertAt( F[ uplo ], n, uplo, layout );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dsptri '+uplo+' n='+n+' pure-addressing packed layout invariance' } );
	});
}

// Step 4c: workspace conformance. dsptri's WORK is a fixed-size (len N) unblocked
// scratch column advertised by the ndarray wrapper (throws below N). Probe the
// smallest accepted length and assert it actually suffices with a POISONED buffer
// (a read-before-write or over-read would surface as NaN in the finite inverse).
test( 'dsptri: workspace minimum (len N) suffices with a poisoned buffer', function t() {
	var uplo = 'upper';
	var N = 33;
	var F = freezeFactor( N, 0xC0FFEE );
	if ( F === null ) {
		throw new Error( 'dsptri workspace setup: dsptrf returned a singular factor' );
	}

	function run( workLen ) {
		var R = schemes.packed.realize( sc, F[ uplo ].factor, { 'part': uplo }, TIGHT );
		var ipiv = F[ uplo ].ipiv.slice();
		var work = poisonedWork( sc, workLen );
		dsptri( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0, work, 1, 0 );
		return check.flattenLogical( sc, readTri( R, N, uplo ) );
	}

	checked( 'dsptri', 'workspace', function check_() {
		var minLen = assertWorkspaceSufficient( run, {}, 'dsptri WORK@N=33 upper' );
		if ( minLen !== N ) {
			throw new Error( 'dsptri: advertised WORK minimum '+minLen+' != N='+N );
		}
	});
});
