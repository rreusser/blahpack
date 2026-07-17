/**
* Property-based validation for zppcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pp` -> HPD PACKED (schemes.packed,
* logical.positiveDefinite = Hermitian positive-definite); `con` (condition-number
* estimate from a packed Cholesky factor) -> PROPERTY: the returned RCOND
* estimates `1/κ₁(A)` where `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. zppcon consumes the packed
* Cholesky factorization (produced here by the already-validated zpptrf) plus a
* caller-supplied `anorm = ‖A0‖₁`. RCOND is an ESTIMATE (zlacn2 gives a lower
* bound on ‖A⁻¹‖₁, so RCOND is an UPPER estimate, tight for these
* well-conditioned diagonally-dominant HPD matrices). We compute the TRUE
* reciprocal condition number INDEPENDENTLY: `anorm` from the full Hermitian A0,
* and `‖A⁻¹‖₁` from an independent packed solve `A0·X = I` via the trusted zppsv
* (X = A⁻¹). RCOND must lie within a small factor F of the truth and in (0,1].
* NOTE the complex signature: WORK is a Complex128Array of 2N elements and the
* final workspace is a real RWORK of N (not IWORK).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zppcon from './../lib/ndarray.js';
import zpptrf from '../../zpptrf/lib/ndarray.js';
import zppsv from '../../zppsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var TIGHT = schemes.packed.layouts()[ 0 ]; // tight, stride 1
var TIGHT_DENSE = schemes.dense.layouts()[ 0 ];
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed zppsv on a fresh
// copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_DENSE );
	var info = zppsv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zppsv failed (info='+info+'); matrix not HPD?' );
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

// Read only the referenced packed uplo triangle back (opposite triangle zero).
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
test( 'zppcon: rcond estimates 1/kappa1(A) (uplo x N)', function t() {
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

	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	zpptrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ] );

	var rcond = new Float64Array( 1 );
	var WORK = new Complex128Array( ( 2 * N ) + 2 );
	var RWORK = new Float64Array( N + 2 );
	zppcon( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );

	var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
	checked( 'zppcon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'zppcon '+uplo+' N='+N );
	});
}

// Step 4: layout-invariance fuzz across a PURE-ADDRESSING packed family (fixed
// unit stride; varying only the base offset via leading/trailing pad). The packed
// factor is built ONCE and re-realized per layout, isolating zppcon from zpptrf.
//
// `upper` is bit-exact across the family. `lower` is NOT bit-exact by ~1 ULP: its
// second solve is a CONJUGATE-TRANSPOSE `L^H·x = y`, and `zlatps` (the complex
// packed triangular solver) has a benign ~1 ULP reorder that depends on the AP
// BASE OFFSET in its conjugate-transpose branch — the harness caught this; see
// test/harness/LEARNINGS.md ("zlatps ... CONJUGATE-TRANSPOSE ... base offset").
// The dense sibling zpocon (using zlatrs) is bit-exact for both uplo, and the
// zppcon correctness PROPERTY passes at every size/uplo, so the effect is a
// bit-exactness artifact of a shared dependency, not a zppcon defect. `lower` is
// therefore fuzzed across the SAME offset family under a TIGHT few-ULP relative
// tolerance (far below any real addressing bug, which would be >>1 ULP or NaN).
var PURE_ADDR = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 7, 'tail': 4 },
	{ 'stride': 1, 'lead': 1, 'tail': 5 }
];
var LOWER_REL_TOL = 1e-12; // >> the ~1 ULP zlatps conj-transpose reorder; << any real bug

// Compute the rcond for every layout in the family, re-realizing the FIXED
// pre-factored triangle each time.
function rcondsAcrossLayouts( uplo, Lfac, N, anorm ) {
	return PURE_ADDR.map( function each( layout ) {
		var Fr = schemes.packed.realize( sc, Lfac, { 'part': uplo }, layout );
		var rcond = new Float64Array( 1 );
		var WORK = new Complex128Array( ( 2 * N ) + 2 );
		var RWORK = new Float64Array( N + 2 );
		zppcon( uplo, N, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
		if ( !Number.isFinite( rcond[ 0 ] ) ) {
			throw new Error( 'zppcon '+uplo+': non-finite rcond (OOB read into poisoned padding?)' );
		}
		return rcond[ 0 ];
	});
}

test( 'zppcon: layout invariance across pure-addressing packed offsets', function t() {
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

	// Factor ONCE, extract the fixed packed factor triangle:
	var Ar0 = schemes.packed.realize( sc, A0, { 'part': uplo }, PURE_ADDR[ 0 ] );
	zpptrf( uplo, N, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ] );
	var Lfac = readTri( Ar0, N, uplo );

	checked( 'zppcon', 'layout-invariance', function run() {
		var vals = rcondsAcrossLayouts( uplo, Lfac, N, anorm );
		var i;
		if ( uplo === 'upper' ) {
			// Bit-exact: any difference is a genuine offset/stride-base bug.
			for ( i = 1; i < vals.length; i++ ) {
				if ( !Object.is( vals[ i ], vals[ 0 ] ) ) {
					throw new Error( 'zppcon upper pure-addressing invariance: variant '+i+' '+vals[ i ]+' != '+vals[ 0 ] );
				}
			}
		} else {
			// lower: tight few-ULP tolerance (documented zlatps conj-transpose reorder).
			for ( i = 1; i < vals.length; i++ ) {
				if ( !( Math.abs( vals[ i ] - vals[ 0 ] ) <= LOWER_REL_TOL * Math.abs( vals[ 0 ] ) ) ) {
					throw new Error( 'zppcon lower pure-addressing invariance: variant '+i+' '+vals[ i ]+' deviates > '+LOWER_REL_TOL+' rel from '+vals[ 0 ] );
				}
			}
		}
	});
}
