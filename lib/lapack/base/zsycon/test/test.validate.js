/**
* Property-based validation for zsycon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sy` -> COMPLEX-SYMMETRIC dense
* (schemes.dense, logical.symmetric — `A(j,i) = A(i,j)`, NO conjugation; this is
* the symmetric, NOT the Hermitian, family — there is no `hecon` analogue here);
* `con` (reciprocal condition number from a Bunch-Kaufman factor) -> PROPERTY: the
* returned RCOND estimates `1/κ₁(A)` where `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. zsycon consumes the
* L*D*L^T / U*D*U^T factorization (produced here by the already-validated zsytrf)
* plus a caller-supplied `anorm = ‖A0‖₁`. RCOND is an ESTIMATE (zlacn2 gives a
* LOWER bound on ‖A⁻¹‖₁, so RCOND is an UPPER estimate). We compute the TRUE
* reciprocal condition number INDEPENDENTLY: `anorm` from the full symmetric A0,
* and `‖A⁻¹‖₁` from an independent solve `A0·X = I` via the trusted zsysv
* (X = A⁻¹). RCOND must lie within a small factor F of the truth and in (0,1].
* zsycon takes a COMPLEX WORK (length 2*N) and NO IWORK. Only the uplo triangle of
* the factor is realized; the opposite stays poisoned, so a wrong-triangle read
* trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zsycon from './../lib/ndarray.js';
import zsytrf from '../../zsytrf/lib/ndarray.js';
import zsysv from '../../zsysv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
var F = 3; // estimate must be within this factor of the true reciprocal cond.

// 1-norm (max abs column sum) of the FULL complex-symmetric logical matrix.
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted zsysv on a fresh copy;
// X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( n );
	var WORK = sc.alloc( Math.max( 1, n ) );
	var info = zsysv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], WORK, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'oracle zsysv failed (info='+info+'); A0 singular?' );
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

// Steps 2-3-5: property across uplo flags and a size sweep. Factor a copy with
// zsytrf, estimate with zsycon, then compare against the independently computed
// true reciprocal condition number.
test( 'zsycon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( uplo, N );
		});
	});
});

function runProperty( uplo, N ) {
	var rng = new RNG( 0x100 + N ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N ); // full complex-symmetric (indefinite) oracle
	var anorm = norm1Full( A0, N );

	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var ipiv = new Int32Array( N );
	zsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );

	var rcond = new Float64Array( 1 );
	var WORK = sc.alloc( ( 2 * N ) + 4 );
	zsycon( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0 );

	var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'zsycon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'zsycon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz. zsycon's inner kernels (zsytrs solve, zlacn2
// norm estimation) run over unit-stride fast paths, so cross-order / stride-sign
// layouts can legitimately reorder arithmetic. Bit-equality is asserted only
// across a PURE-ADDRESSING family: fixed unit col-major stride, varying ONLY base
// offset, leading pad, and leading-dimension padding — which cannot change
// arithmetic order — so any residual difference is a genuine addressing bug. The
// factor + IPIV are built ONCE and re-realized per layout, isolating zsycon from
// zsytrf's own reordering / pivot-decision sensitivity (see LEARNINGS zhetrf).
var PURE_ADDR = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 3, 'tail': 2 }
];

test( 'zsycon: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var SEED = 0xF00D;
	var rng = new RNG( SEED );
	var A0 = logical.symmetric( sc, rng, N );
	var anorm = norm1Full( A0, N );

	// Factor ONCE, extract the fixed factor triangle + fixed IPIV:
	var Ar0 = schemes.dense.realize( sc, A0, { 'part': uplo }, PURE_ADDR[ 0 ] );
	var ipiv = new Int32Array( N );
	zsytrf( uplo, N, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ], Ar0.args[ 2 ], ipiv, 1, 0 );
	var Lfac = readTri( Ar0, N, uplo );

	checked( 'zsycon', 'layout-invariance', function run() {
		layoutInvariant( PURE_ADDR, function build( layout ) {
			var Fr = schemes.dense.realize( sc, Lfac, { 'part': uplo }, layout );
			var rcond = new Float64Array( 1 );
			var WORK = sc.alloc( ( 2 * N ) + 4 );
			zsycon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], Fr.args[ 2 ], ipiv, 1, 0, anorm, rcond, WORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'zsycon '+uplo+' pure-addressing layout invariance' } );
	});
}
