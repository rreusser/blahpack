/**
* Property-based validation for dpocon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `con` (condition-number estimate from a Cholesky
* factor) -> PROPERTY: the returned RCOND estimates `1/κ₁(A)` where
* `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. dpocon consumes the Cholesky factorization (produced here
* by the already-validated dpotrf) plus a caller-supplied `anorm = ‖A0‖₁`. RCOND
* is an ESTIMATE (dlacn2 gives a lower bound on ‖A⁻¹‖₁, so RCOND is an UPPER
* estimate, tight for these well-conditioned diagonally-dominant SPD matrices).
* We compute the TRUE reciprocal condition number INDEPENDENTLY: `anorm` from the
* full symmetric A0, and `‖A⁻¹‖₁` from an independent solve `A0·X = I` via the
* trusted dposv (X = A⁻¹). RCOND must lie within a small factor F of the truth and
* in (0,1]. Only the uplo triangle of the factor is realized; the opposite stays
* poisoned, so a read of the wrong triangle trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpocon from './../lib/ndarray.js';
import dpotrf from '../../dpotrf/lib/ndarray.js';
import dposv from '../../dposv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted dposv on a fresh copy;
// X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	const Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	const info = dposv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dposv failed (info='+info+'); matrix not SPD?' );
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

// Steps 2-3-5: property across uplo flags and a size sweep. Factor a copy with
// dpotrf, estimate with dpocon, then compare against the independently computed
// true reciprocal condition number.
test( 'dpocon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
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

	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	dpotrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ] );

	const rcond = new Float64Array( 1 );
	const WORK = new Float64Array( ( 3 * N ) + 4 );
	const IWORK = new Int32Array( N + 4 );
	dpocon( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	const trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'dpocon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'dpocon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz. dpocon's inner kernels (dlatrs triangular
// solves over columns of the factor with unit inner stride, dlacn2 over WORK with
// unit stride, idamax) take exact unit-stride paths, so a non-unit / negative /
// row-major layout legitimately reorders arithmetic. Bit-equality is therefore
// asserted across a PURE-ADDRESSING family: fixed unit col-major stride, varying
// ONLY base offset, leading pad, and leading-dimension padding (which changes
// only column-base addressing, never the inner loop stride), so any residual
// difference is a genuine offset/stride-base addressing bug. The factor is built
// ONCE and re-realized per layout, isolating dpocon from dpotrf's own reordering.
const PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 2 }
];

test( 'dpocon: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
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

	// Factor ONCE, extract the fixed factor triangle:
	const Ar0 = schemes.dense.realize( sc, A0, { 'part': uplo }, PURE_ADDR[ 0 ] );
	dpotrf( uplo, N, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ], Ar0.args[ 2 ] );
	const Lfac = readTri( Ar0, N, uplo );

	checked( 'dpocon', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			const Fr = schemes.dense.realize( sc, Lfac, { 'part': uplo }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Float64Array( ( 3 * N ) + 4 );
			const IWORK = new Int32Array( N + 4 );
			dpocon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], Fr.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'dpocon '+uplo+' pure-addressing layout invariance' } );
	});
}
