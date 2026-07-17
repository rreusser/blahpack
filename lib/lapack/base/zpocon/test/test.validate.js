/**
* Property-based validation for zpocon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `po` -> HPD dense (schemes.dense,
* logical.positiveDefinite = Hermitian positive-definite); `con` (condition-number
* estimate from a Cholesky factor) -> PROPERTY: the returned RCOND estimates
* `1/κ₁(A)` where `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. zpocon consumes the Cholesky factorization
* (produced here by the already-validated zpotrf) plus a caller-supplied
* `anorm = ‖A0‖₁`. RCOND is an ESTIMATE (zlacn2 gives a lower bound on ‖A⁻¹‖₁, so
* RCOND is an UPPER estimate, tight for these well-conditioned diagonally-dominant
* HPD matrices). We compute the TRUE reciprocal condition number INDEPENDENTLY:
* `anorm` from the full Hermitian A0, and `‖A⁻¹‖₁` from an independent solve
* `A0·X = I` via the trusted zposv (X = A⁻¹). RCOND must lie within a small factor
* F of the truth and in (0,1]. NOTE the complex signature: WORK is a
* Complex128Array of 2N elements and the final workspace is a real RWORK of N
* (not IWORK).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpocon from './../lib/ndarray.js';
import zpotrf from '../../zpotrf/lib/ndarray.js';
import zposv from '../../zposv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
var F = 3; // estimate must be within this factor of the true reciprocal cond.

// 1-norm (max abs column sum) of the FULL Hermitian logical matrix.
function norm1Full( M, n ) {
	var mx = 0.0;
	var s;
	var i;
	var j;
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
	var I = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted zposv on a fresh copy;
// X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	var info = zposv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zposv failed (info='+info+'); matrix not HPD?' );
	}
	var mx = 0.0;
	var s;
	var i;
	var j;
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
	var Tri = new LogicalMatrix( sc, n, n );
	var i;
	var j;
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
test( 'zpocon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( uplo, N );
		});
	});
});

function runProperty( uplo, N ) {
	var rng = new RNG( 0x100 + N ); // reproducible; log on failure
	var A0 = logical.positiveDefinite( sc, rng, N ); // full Hermitian/HPD oracle
	var anorm = norm1Full( A0, N );

	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	zpotrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ] );

	var rcond = new Float64Array( 1 );
	var WORK = new Complex128Array( ( 2 * N ) + 2 );
	var RWORK = new Float64Array( N + 2 );
	zpocon( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );

	var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'zpocon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'zpocon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz across a PURE-ADDRESSING family (fixed unit
// col-major stride; varying only base offset / leading pad / leading-dimension
// padding, which never changes the inner unit-stride arithmetic of the zlatrs
// solves / zlacn2 / izamax), so any residual difference is a genuine
// offset/stride-base addressing bug. The factor is built ONCE and re-realized per
// layout, isolating zpocon from zpotrf's own reordering.
var PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 2 }
];

test( 'zpocon: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var SEED = 0xF00D;
	var rng = new RNG( SEED );
	var A0 = logical.positiveDefinite( sc, rng, N );
	var anorm = norm1Full( A0, N );

	// Factor ONCE, extract the fixed factor triangle:
	var Ar0 = schemes.dense.realize( sc, A0, { 'part': uplo }, PURE_ADDR[ 0 ] );
	zpotrf( uplo, N, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ], Ar0.args[ 2 ] );
	var Lfac = readTri( Ar0, N, uplo );

	checked( 'zpocon', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			var Fr = schemes.dense.realize( sc, Lfac, { 'part': uplo }, layout );
			var rcond = new Float64Array( 1 );
			var WORK = new Complex128Array( ( 2 * N ) + 2 );
			var RWORK = new Float64Array( N + 2 );
			zpocon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], Fr.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'zpocon '+uplo+' pure-addressing layout invariance' } );
	});
}
