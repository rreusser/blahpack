/**
* Property-based validation for dppcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pp` -> SPD PACKED (schemes.packed,
* logical.positiveDefinite); `con` (condition-number estimate from a packed
* Cholesky factor) -> PROPERTY: the returned RCOND estimates `1/κ₁(A)` where
* `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. dppcon consumes the packed Cholesky factorization (produced
* here by the already-validated dpptrf) plus a caller-supplied `anorm = ‖A0‖₁`.
* RCOND is an ESTIMATE (dlacn2 gives a lower bound on ‖A⁻¹‖₁, so RCOND is an
* UPPER estimate, tight for these well-conditioned diagonally-dominant SPD
* matrices). We compute the TRUE reciprocal condition number INDEPENDENTLY:
* `anorm` from the full symmetric A0, and `‖A⁻¹‖₁` from an independent packed
* solve `A0·X = I` via the trusted dppsv (X = A⁻¹). RCOND must lie within a small
* factor F of the truth and in (0,1].
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dppcon from './../lib/ndarray.js';
import dpptrf from '../../dpptrf/lib/ndarray.js';
import dppsv from '../../dppsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const TIGHT = schemes.packed.layouts()[ 0 ]; // tight, stride 1
const TIGHT_DENSE = schemes.dense.layouts()[ 0 ];
const F = 3; // estimate must be within this factor of the true reciprocal cond.

// 1-norm (max abs column sum) of the FULL symmetric/Hermitian logical matrix.
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed dppsv on a fresh
// copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	const Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_DENSE );
	const info = dppsv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dppsv failed (info='+info+'); matrix not SPD?' );
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

// Read only the referenced packed uplo triangle back (opposite triangle zero).
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

// Steps 2-3-5: property across uplo flags and a size sweep.
test( 'dppcon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( uplo, N );
		});
	});
});

function runProperty( uplo, N ) {
	const rng = new RNG( 0x100 + N ); // reproducible; log on failure
	const A0 = logical.positiveDefinite( sc, rng, N ); // full symmetric/SPD oracle
	const anorm = norm1Full( A0, N );

	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	dpptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ] );

	const rcond = new Float64Array( 1 );
	const WORK = new Float64Array( ( 3 * N ) + 4 );
	const IWORK = new Int32Array( N + 4 );
	dppcon( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	const trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'dppcon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'dppcon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz across a PURE-ADDRESSING packed family: fixed
// unit stride, varying ONLY base offset via leading/trailing pad (which cannot
// change the inner unit-stride arithmetic of dlatps / dlacn2 / idamax), so any
// residual difference is a genuine offset/stride-base addressing bug. The packed
// factor is built ONCE and re-realized per layout, isolating dppcon from dpptrf.
const PURE_ADDR = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 7, 'tail': 4 },
	{ 'stride': 1, 'lead': 1, 'tail': 5 }
];

test( 'dppcon: bit-exact across pure-addressing packed layouts (offset)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 9;
	const SEED = 0xF00D;
	const rng = new RNG( SEED );
	const A0 = logical.positiveDefinite( sc, rng, N );
	const anorm = norm1Full( A0, N );

	// Factor ONCE, extract the fixed packed factor triangle:
	const Ar0 = schemes.packed.realize( sc, A0, { 'part': uplo }, PURE_ADDR[ 0 ] );
	dpptrf( uplo, N, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ] );
	const Lfac = readTri( Ar0, N, uplo );

	checked( 'dppcon', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			const Fr = schemes.packed.realize( sc, Lfac, { 'part': uplo }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Float64Array( ( 3 * N ) + 4 );
			const IWORK = new Int32Array( N + 4 );
			dppcon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dppcon '+uplo+' pure-addressing packed layout invariance' } );
	});
}
