/**
* Property-based validation for dspcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sp` -> symmetric PACKED
* (schemes.packed, logical.symmetric — real analogue of the complex-symmetric
* family, a plain symmetric INDEFINITE matrix, NOT Hermitian, NOT SPD); `con`
* (reciprocal condition number from a Bunch-Kaufman factor) -> PROPERTY: the
* returned RCOND estimates `1/κ₁(A)` where `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. dspcon consumes the
* packed L*D*L^T / U*D*U^T factorization (produced here by the already-validated
* dsptrf) plus a caller-supplied `anorm = ‖A0‖₁`. RCOND is an ESTIMATE (dlacn2
* gives a LOWER bound on ‖A⁻¹‖₁, so RCOND is an UPPER estimate). We compute the
* TRUE reciprocal condition number INDEPENDENTLY: `anorm` from the full symmetric
* A0, and `‖A⁻¹‖₁` from an independent packed solve `A0·X = I` via the trusted
* dspsv (X = A⁻¹). RCOND must lie within a small factor F of the truth and in
* (0,1]. Unused packed slots stay poisoned, so any out-of-range read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dspcon from './../lib/ndarray.js';
import dsptrf from '../../dsptrf/lib/ndarray.js';
import dspsv from '../../dspsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const TIGHT_PK = { 'stride': 1, 'lead': 0, 'tail': 0 }; // tight packed
const TIGHT_DN = schemes.dense.layouts()[ 0 ]; // tight col-major dense (for B)
const F = 3; // estimate must be within this factor of the true reciprocal cond.

// 1-norm (max abs column sum) of the FULL symmetric logical matrix.
function norm1Full( M, n ) {
	let mx = 0.0;
	let s, i, j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Identity logical matrix (n x n).
function identity( n ) {
	const I = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed dspsv on a fresh
// packed copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	const Ap = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT_PK );
	const Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_DN );
	const ipiv = new Int32Array( n );
	const info = dspsv( uplo, n, n, Ap.data, Ap.args[ 0 ], Ap.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dspsv failed (info='+info+'); A0 singular?' );
	}
	let mx = 0.0;
	let s, i, j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( Br.read( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Read only the referenced uplo triangle back (opposite triangle exact zero).
function readTri( R, n, uplo ) {
	const Tri = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				Tri.set( i, j, R.read( i, j ) );
			}
		}
	}
	return Tri;
}

function assertRcond( rcond, trueRcond, label ) {
	if ( !Number.isFinite( rcond ) ) {
		throw new Error( label+': rcond is not finite ('+rcond+')' );
	}
	if ( !( rcond > 0.0 && rcond <= 1.0 + 1e-9 ) ) {
		throw new Error( label+': rcond '+rcond+' not in (0,1]' );
	}
	if ( !( rcond <= F * trueRcond && rcond >= trueRcond / F ) ) {
		throw new Error( label+': rcond '+rcond.toExponential( 6 )+' not within factor '+F+' of true '+trueRcond.toExponential( 6 ) );
	}
}

// Steps 2-3-5: property across uplo flags and a size sweep. Factor a packed copy
// with dsptrf, estimate with dspcon, then compare against the independently
// computed true reciprocal condition number.
test( 'dspcon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( uplo, N );
		});
	});
});

function runProperty( uplo, N ) {
	const rng = new RNG( 0x100 + N ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, N ); // full symmetric (indefinite) oracle
	const anorm = norm1Full( A0, N );

	const Ap = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT_PK );
	const ipiv = new Int32Array( N );
	dsptrf( uplo, N, Ap.data, Ap.args[ 0 ], Ap.args[ 1 ], ipiv, 1, 0 );

	const rcond = new Float64Array( 1 );
	const WORK = new Float64Array( ( 2 * N ) + 4 );
	const IWORK = new Int32Array( N + 4 );
	dspcon( uplo, N, Ap.data, Ap.args[ 0 ], Ap.args[ 1 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	const trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'dspcon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'dspcon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz. dspcon's inner kernels (dsptrs packed solve,
// dlacn2 norm estimation) hit unit-stride fast paths, and the real packed BLAS
// kernels (dspmv/dtpsv/ddot) regroup summation on a stride change (see LEARNINGS
// dpptri/dasum). Bit-equality is therefore asserted only across a PURE-ADDRESSING
// packed family: fixed unit stride, varying ONLY the base offset (lead/tail),
// which cannot reorder arithmetic. Any residual diff is a genuine packed
// base-offset addressing bug. The factor + IPIV are built ONCE and re-realized
// per layout, isolating dspcon from dsptrf's own pivot-decision sensitivity.
const PACKED_PURE = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 5, 'tail': 1 },
	{ 'stride': 1, 'lead': 2, 'tail': 4 }
];

test( 'dspcon: bit-exact across pure-addressing packed layouts (base offset)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 9;
	const SEED = 0xF00D;
	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, N );
	const anorm = norm1Full( A0, N );

	// Factor ONCE, extract the fixed factor triangle + fixed IPIV:
	const Ap0 = schemes.packed.realize( sc, A0, { 'part': uplo }, PACKED_PURE[ 0 ] );
	const ipiv = new Int32Array( N );
	dsptrf( uplo, N, Ap0.data, Ap0.args[ 0 ], Ap0.args[ 1 ], ipiv, 1, 0 );
	const Lfac = readTri( Ap0, N, uplo );

	checked( 'dspcon', 'layout-invariance', function run() {
		layoutInvariant( PACKED_PURE, function build( layout ) {
			const Fr = schemes.packed.realize( sc, Lfac, { 'part': uplo }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Float64Array( ( 2 * N ) + 4 );
			const IWORK = new Int32Array( N + 4 );
			dspcon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dspcon '+uplo+' pure-addressing packed layout invariance' } );
	});
}
