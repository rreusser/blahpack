/**
* Property-based validation for ztrcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr` -> triangular dense
* (schemes.dense, logical.triangular); `con` (self-contained condition-number
* ESTIMATOR) -> PROPERTY: ztrcon returns `rcond ≈ 1/κ` with κ = ‖A‖·‖A⁻¹‖ in the
* chosen norm. ztrcon computes ‖A‖ itself (zlantr) and estimates ‖A⁻¹‖ (zlacn2 +
* zlatrs). We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of
* A0; ‖A⁻¹‖ from A⁻¹ via the already-validated ztrtri. Assert agreement within a
* modest factor F and rcond ∈ (0,1].
*
* NOTE: ztrcon's second workspace is a REAL RWORK (Float64Array, length N) — NOT
* an integer IWORK; WORK is a Complex128Array of length 2N.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrcon from './../lib/ndarray.js';
import ztrtri from '../../ztrtri/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];
var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];
var FACTOR = 5;
var TIGHT = schemes.dense.layouts()[ 0 ];

// 1-norm (max abs column sum) or inf-norm (max abs row sum) of a LogicalMatrix.
function normOf( M, which ) {
	var best = 0.0;
	var s;
	var i;
	var j;
	if ( which === 'one' ) {
		for ( j = 0; j < M.cols; j++ ) {
			s = 0.0;
			for ( i = 0; i < M.rows; i++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
	} else {
		for ( i = 0; i < M.rows; i++ ) {
			s = 0.0;
			for ( j = 0; j < M.cols; j++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
	}
	return best;
}

// Read the inverse triangle back into a full LogicalMatrix (opposite triangle
// exact zero; an unreferenced unit diagonal is filled with 1).
function readTri( R, n, uplo, unit ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, j, unit ? sc.one : R.read( i, j ) );
			} else if ( uplo === 'upper' ? i < j : i > j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// INDEPENDENT true inverse via ztrtri (in place on a fresh realized copy).
function triInverse( A0, n, uplo, diag, unit ) {
	var R = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	ztrtri( uplo, diag, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
	return readTri( R, n, uplo, unit );
}

test( 'ztrcon: rcond ≈ 1/κ vs independent truth (norm x uplo x diag x N)', function t() {
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
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, TIGHT );
	var RCOND = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * N );
	var RWORK = new Float64Array( N );
	var info = ztrcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );

	// Independent truth:
	var Ainv = triInverse( A0, N, uplo, diag, unit );
	var invnorm = normOf( Ainv, nm.which );
	var trueRcond = 1.0 / ( anorm * invnorm );

	var label = 'ztrcon ' + nm.api + ' ' + uplo + ' ' + diag + ' N=' + N;
	checked( 'ztrcon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		var r = RCOND[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. Self-contained (no pivot search); inner
// zlantr/zlatrs/zlacn2 read A(i,j) by value -> bit-exact across ALL 7 layouts.
test( 'ztrcon: bit-exact across all storage layouts', function t() {
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
	checked( 'ztrcon', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo, 'unit': unit }, layout );
			var RCOND = new Float64Array( 1 );
			var WORK = new Complex128Array( 2 * N );
			var RWORK = new Float64Array( N );
			ztrcon( nm.api, uplo, diag, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );
			return [ RCOND[ 0 ] ];
		}, { 'label': 'ztrcon ' + nm.api + ' ' + uplo + ' ' + diag + ' layout invariance' } );
	} );
}
