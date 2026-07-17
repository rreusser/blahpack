/**
* Property-based validation for ztpcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tp` -> triangular PACKED
* (schemes.packed, logical.triangular); `con` (self-contained condition-number
* ESTIMATOR) -> PROPERTY: ztpcon returns `rcond ≈ 1/κ` with κ = ‖A‖·‖A⁻¹‖ in the
* chosen norm. ztpcon computes ‖A‖ itself (zlantp) and estimates ‖A⁻¹‖ (zlacn2 +
* zlatps). We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of
* A0; ‖A⁻¹‖ from A⁻¹ obtained by the already-validated packed ztptri (independent
* of ztpcon's estimator). Assert agreement within a modest factor F and rcond ∈
* (0,1]. No pre-factorization. NOTE the complex signature: WORK is a
* Complex128Array of 2N and the final workspace is a real RWORK of N (not IWORK).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztpcon from './../lib/ndarray.js';
import ztptri from '../../ztptri/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];
var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];

// The estimate is a lower bound on ‖A⁻¹‖ (=> upper bound on true_rcond). Unit
// triangular matrices with O(1) off-diagonals are more ill-conditioned, so the
// estimator's slack widens; F=5 comfortably covers the observed agreement while
// still catching an order-of-magnitude-wrong estimate.
var F = 5;
var TIGHT = schemes.packed.layouts()[ 0 ]; // tight, stride 1

// 1-norm (max abs col sum) or inf-norm (max abs row sum) of a LogicalMatrix.
function normOf( M, which ) {
	if ( which === 'one' ) {
		return norms.oneNorm( sc, M );
	}
	return norms.infNorm( sc, M );
}

// Read the packed inverse triangle back into a full LogicalMatrix (opposite
// triangle exact zero; an unreferenced unit diagonal is filled with 1).
function readTri( R, n, uplo, unit ) {
	var T = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j ) {
				T.set( i, j, unit ? sc.one : R.read( i, j ) );
			} else if ( uplo === 'upper' ? i < j : i > j ) {
				T.set( i, j, R.read( i, j ) );
			} else {
				T.set( i, j, sc.zero );
			}
		}
	}
	return T;
}

// INDEPENDENT true inverse via packed ztptri (in place on a fresh realized copy).
function triInverse( A0, n, uplo, diag, unit ) {
	var R = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	ztptri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ] );
	return readTri( R, n, uplo, unit );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x uplo x diag x N.
test( 'ztpcon: rcond ≈ 1/κ vs independent truth (norm x uplo x diag x N)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				SIZES_SMALL.forEach( function eachN( N ) {
					runProperty( nm, uplo, diag, N );
				});
			});
		});
	});
});

function runProperty( nm, uplo, diag, N ) {
	var unit = ( diag === 'unit' );
	var rng = new RNG( 0x100 + N ); // reproducible; log on failure
	var A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	var anorm = normOf( A0, nm.which ); // A0 already holds the full math triangle

	// Estimator (self-contained; computes its own ‖A‖):
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	var RCOND = new Float64Array( 1 );
	var WORK = new Complex128Array( ( 2 * N ) + 2 );
	var RWORK = new Float64Array( N + 2 );
	var info = ztpcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );

	// Independent truth:
	var Ainv = triInverse( A0, N, uplo, diag, unit );
	var invnorm = normOf( Ainv, nm.which );
	var trueRcond = 1.0 / ( anorm * invnorm );

	var label = 'ztpcon ' + nm.api + ' ' + uplo + ' ' + diag + ' N=' + N;
	checked( 'ztpcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		var r = RCOND[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= F * trueRcond && trueRcond <= F * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + F + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance across ALL packed layouts (strides 1/2/3 and negative
// −1/−2, incl. offset/pad). ztpcon's estimator runs BOTH a no-transpose and a
// CONJUGATE-TRANSPOSE packed solve through `zlatps` every call (dlacn2 alternates
// KASE) plus zlantp/zdrscl/izamax; all read the packed AP by value with algorithm-
// fixed loop order, so the estimate is bit-exact across every packed layout. NOTE:
// this exposed and FIXED a real bug — `zlatps` had dropped `*strideAP` from its
// base packed pointers, returning a wrong rcond (or 0 / NaN) for any strideAP ≠ 1
// or any offset in the lower path; see test/harness/LEARNINGS.md ("zlatps ...
// IGNORES `strideAP` in its base packed pointers"). Post-fix, all layouts match
// bit-for-bit.
test( 'ztpcon: bit-exact across all packed storage layouts', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				runInvariance( nm, uplo, diag );
			});
		});
	});
});

function runInvariance( nm, uplo, diag ) {
	var N = 9;
	var unit = ( diag === 'unit' );
	var SEED = 0x100 + N;
	var layouts = schemes.packed.layouts();
	checked( 'ztpcon', 'layout-invariance', function run() {
		var ref = null;
		var idx = 0;
		layouts.forEach( function each( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
			var Ar = schemes.packed.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			var RCOND = new Float64Array( 1 );
			var WORK = new Complex128Array( ( 2 * N ) + 2 );
			var RWORK = new Float64Array( N + 2 );
			ztpcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );
			if ( !Number.isFinite( RCOND[ 0 ] ) ) {
				throw new Error( 'ztpcon '+nm.api+' '+uplo+' '+diag+' variant '+idx+': non-finite rcond (OOB read into poisoned padding?)' );
			}
			if ( ref === null ) {
				ref = RCOND[ 0 ];
			} else if ( !Object.is( RCOND[ 0 ], ref ) ) {
				throw new Error( 'ztpcon '+nm.api+' '+uplo+' '+diag+' layout variant '+idx+': '+RCOND[ 0 ]+' != '+ref );
			}
			idx += 1;
		});
	} );
}
