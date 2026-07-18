/**
* Property-based validation for dsytri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — dsytri is COMPLEX-SYMMETRIC, so the real
* analogue is a plain symmetric matrix, NOT Hermitian); `tri` (inverse from a
* Bunch-Kaufman factor) -> RECONSTRUCTION: A0 * inv(A0) = I. Input is the
* Bunch-Kaufman factor + IPIV (produced by calling dsytrf in place); output
* overwrites the uplo triangle with inv(A), which is symmetric — the opposite
* triangle is NOT referenced. The FULL symmetric logical matrix A0 is the
* independent oracle; the product of the original with the computed inverse must
* be the identity, at backward-error tolerance.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dsytri from './../lib/ndarray.js';
import dsytrf from '../../dsytrf/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (stored in the uplo triangle) back into a FULL
// symmetric LogicalMatrix by mirroring the referenced triangle across the
// diagonal. dsytri is COMPLEX-SYMMETRIC (no conjugation on the mirror); for a
// real scalar sc.conj is the identity, so this is a plain symmetric mirror.
function readSymFull( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let v, i, j;
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

// Read only the referenced uplo triangle back (opposite triangle exact zero) for
// bit-exact layout-invariance flattening.
function readTri( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
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

// Read the uplo triangle of a factored physical buffer into a full LogicalMatrix
// (opposite triangle zeroed) so it can be RE-REALIZED at another layout. Used to
// freeze the Bunch-Kaufman factor for the layout-invariance test.
function factorLogical( R, n, uplo ) {
	return readTri( R, n, uplo );
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + √n (NOT ‖I‖ alone), recovering the backward-stable ~n·eps
// quantity even when the (indefinite) A0 is moderately ill-conditioned.
function assertInvResidual( A0, invA, P, n, label, factor ) {
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB read into poisoned storage
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep, both uplo
// flags, and every PIVOT-VALID storage layout. SIZES_SMALL spans the unblocked
// and blocked (N=33,64) paths. The factor (dsytrf) does an idamax pivot search
// over a column, so a negative first-dimension (row) stride is out of contract
// (see LEARNINGS getrf/getf2 family) — hence pivotLayouts, which still exercise
// col AND row order, padded leading dims, gaps, and negative COLUMN stride. At
// backward-error tolerance this certifies cross-storage-order addressing of BOTH
// the factor and the inverse.
test( 'dsytri: inverse reconstruction A*inv(A)=I (size sweep x uplo x pivot layouts)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
				runReconstruct( uplo, n, layout );
			});
		});
	});
});

function runReconstruct( uplo, n, layout ) {
	const rng = new RNG( 0x100 + n ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, n );
	const R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const ipiv = new Int32Array( Math.max( n, 1 ) );
	const work = poisonedWork( sc, Math.max( n, 1 ) ); // poisoned scratch (len N)

	let info = dsytrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0 );
	if ( info !== 0 ) {
		return; // rare singular draw — inverse undefined, not an inverse-validity case
	}
	info = dsytri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
	if ( info !== 0 ) {
		return;
	}
	const invA = readSymFull( R, n, uplo );
	const P = ref.matmul( sc, A0, invA );
	checked( 'dsytri', 'reconstruct', function run() {
		assertInvResidual( A0, invA, P, n, 'dsytri '+uplo+' n='+n, 100 );
	});
}

// Step 4: layout-invariance fuzz on dsytri's OWN addressing. dsytrf makes
// DISCRETE Bunch-Kaufman pivot choices that can flip on a last-ULP layout change
// (see LEARNINGS zhetrf pivot-flip entry), so to isolate the INVERSE kernel we
// pre-factor ONCE at a tight col-major layout, freeze the factor values + IPIV,
// then re-realize that fixed factor at each layout and run only dsytri. Even so,
// dsytri's unblocked kernel bottoms out in reference-BLAS unit-stride fast paths
// (ddot/dsymv/dcopy) whose summation order shifts ~1 ULP with stride sign / gap /
// storage order (see the dpotri/dpptri LEARNINGS entry, which names dsytri). So
// bit-equality is asserted across a PURE-ADDRESSING family only: tight col-major,
// g=1, positive strides, varying ONLY base offset, leading pad, and leading-dim
// padding — which cannot change arithmetic order, so any residual difference is a
// genuine offset/leading-dim addressing bug. Cross-order/sign/gap correctness is
// covered by the reconstruction sweep above. Records L3 honestly.
const PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 11, 'tail': 0 }
];
const TIGHT_COL = PURE_ADDR[ 0 ];

test( 'dsytri: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, 40 );
	});
});

function runInvariance( uplo, n ) {
	const SEED = 0xF00D;

	// Pre-factor ONCE at a tight col-major layout and freeze the factor + IPIV:
	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, n );
	const Rf = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT_COL );
	const ipiv0 = new Int32Array( n );
	const info = dsytrf( uplo, n, Rf.data, Rf.args[ 0 ], Rf.args[ 1 ], Rf.args[ 2 ], ipiv0, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'dsytri invariance setup: dsytrf returned info='+info+' (singular factor)' );
	}
	const Ffac = factorLogical( Rf, n, uplo ); // frozen factor in the uplo triangle

	checked( 'dsytri', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			const R = schemes.dense.realize( sc, Ffac, { 'part': uplo }, layout );
			const ipiv = ipiv0.slice();
			const work = poisonedWork( sc, n );
			const code = dsytri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			if ( code !== 0 ) {
				throw new Error( 'dsytri returned info='+code );
			}
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'dsytri '+uplo+' n='+n+' pure-addressing layout invariance' } );
	});
}

// Step 4c: workspace conformance. dsytri's WORK is a fixed-size (len N) unblocked
// scratch column advertised by the ndarray wrapper (throws below N). Probe the
// smallest accepted length and assert it actually suffices with a POISONED buffer
// (a read-before-write or over-read would surface as NaN in the finite inverse).
test( 'dsytri: workspace minimum (len N) suffices with a poisoned buffer', function t() {
	const uplo = 'upper';
	const N = 33;
	const SEED = 0xC0FFEE;

	// Freeze a valid Bunch-Kaufman factor once (WORK sizing is independent of it):
	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, N );
	const Rf = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT_COL );
	const ipiv0 = new Int32Array( N );
	const info = dsytrf( uplo, N, Rf.data, Rf.args[ 0 ], Rf.args[ 1 ], Rf.args[ 2 ], ipiv0, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'dsytri workspace setup: dsytrf info='+info );
	}
	const Ffac = factorLogical( Rf, N, uplo );

	function run( workLen ) {
		const R = schemes.dense.realize( sc, Ffac, { 'part': uplo }, TIGHT_COL );
		const ipiv = ipiv0.slice();
		const work = poisonedWork( sc, workLen );
		dsytri( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
		return check.flattenLogical( sc, readTri( R, N, uplo ) );
	}

	checked( 'dsytri', 'workspace', function check_() {
		const minLen = assertWorkspaceSufficient( run, {}, 'dsytri WORK@N=33 upper' );
		if ( minLen !== N ) {
			throw new Error( 'dsytri: advertised WORK minimum '+minLen+' != N='+N );
		}
	});
});
