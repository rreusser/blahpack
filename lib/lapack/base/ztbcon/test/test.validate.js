/**
* Property-based validation for ztbcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tb` -> triangular BANDED
* (schemes.banded with half-bandwidth kd, logical.triangularBanded); `con`
* (self-contained condition-number ESTIMATOR) -> PROPERTY: ztbcon returns
* `rcond ≈ 1/κ` with κ = ‖A‖·‖A⁻¹‖ in the chosen norm. ztbcon computes ‖A‖ itself
* (zlantb) and estimates ‖A⁻¹‖ (zlacn2 + zlatbs). We compute the TRUE value
* INDEPENDENTLY: anorm = exact 1-/inf-norm of the full logical A0; ‖A⁻¹‖ from A⁻¹
* obtained by solving A·X = I with the already-validated banded triangular solve
* ztbtrs (independent of ztbcon's zlacn2/zlatbs estimator). Assert agreement
* within a modest factor F and rcond ∈ (0,1].
*
* NOTE: ztbcon's second workspace is a REAL RWORK (Float64Array, length N) — NOT
* an integer IWORK; WORK is a Complex128Array of length 2N.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztbcon from './../lib/ndarray.js';
import ztbtrs from '../../ztbtrs/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];
var UPLOS = [ 'upper', 'lower' ];
var DIAGS = [ 'non-unit', 'unit' ];
var NS = [ 2, 3, 5, 8, 16, 17, 33 ];
var FACTOR = 5;
var TIGHT = schemes.banded.layouts()[ 0 ];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1].
function bands( n ) {
	var hi = Math.max( 0, n - 1 );
	var out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		var v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

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

// INDEPENDENT ‖A⁻¹‖: solve A·X = I with ztbtrs (banded triangular solve) on a
// fresh realized band, read the dense solution back into a full LogicalMatrix,
// and take its norm. The inverse of a triangular band matrix is a FULL (dense)
// triangle, so B is a dense N x N identity that ztbtrs overwrites with A⁻¹.
function invNorm( A0, N, uplo, diag, kd, unit, which ) {
	var Ab = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, TIGHT );
	var I = new LogicalMatrix( sc, N, N );
	var Ainv = new LogicalMatrix( sc, N, N );
	var B;
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		I.set( i, i, sc.one );
	}
	B = schemes.dense.realize( sc, I, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	ztbtrs( uplo, 'no-transpose', diag, N, kd, N, Ab.data, Ab.args[ 0 ], Ab.args[ 1 ], Ab.args[ 2 ], B.data, B.args[ 0 ], B.args[ 1 ], B.args[ 2 ] );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Ainv.set( i, j, B.read( i, j ) );
		}
	}
	return normOf( Ainv, which );
}

// Steps 2-3-5: estimate-vs-truth PROPERTY across norm x uplo x diag x N x kd.
test( 'ztbcon: rcond ≈ 1/κ vs independent truth (norm x uplo x diag x N x kd)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				NS.forEach( function eachN( N ) {
					bands( N ).forEach( function eachK( kd ) {
						runProperty( nm, uplo, diag, N, kd );
					});
				});
			});
		});
	});
});

function runProperty( nm, uplo, diag, N, kd ) {
	var unit = ( diag === 'unit' );
	var rng = new RNG( 0x100 + ( N * 10 ) + kd ); // reproducible; log on failure
	var A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
	var anorm = normOf( A0, nm.which ); // A0 already holds the full math band

	// Estimator (self-contained; computes its own ‖A‖):
	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, TIGHT );
	var RCOND = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * N );
	var RWORK = new Float64Array( N );
	var info = ztbcon( nm.api, uplo, diag, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );

	// Independent truth:
	var invnorm = invNorm( A0, N, uplo, diag, kd, unit, nm.which );
	var trueRcond = 1.0 / ( anorm * invnorm );

	var label = 'ztbcon ' + nm.api + ' ' + uplo + ' ' + diag + ' N=' + N + ' kd=' + kd;
	checked( 'ztbcon', 'property', function run() {
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

// Step 4: layout-invariance. ztbcon is self-contained (no pivot search); its
// inner zlantb/zlatbs/zlacn2 walk the band by value in a FIXED element order set
// by the algorithm, not physical storage — the band-array strides (s1, s2) and
// offset change only addressing, never the accumulation order. So the estimate
// is bit-exact across ALL 7 band-array layouts (col AND row, incl. negative
// strides) for a fixed (norm, uplo, diag).
test( 'ztbcon: bit-exact across all storage layouts', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		UPLOS.forEach( function eachUplo( uplo ) {
			DIAGS.forEach( function eachDiag( diag ) {
				runInvariance( nm, uplo, diag );
			});
		});
	});
});

function runInvariance( nm, uplo, diag ) {
	var N = 11;
	var kd = 3;
	var unit = ( diag === 'unit' );
	var SEED = 0xF22E;
	checked( 'ztbcon', 'layout-invariance', function run() {
		layoutInvariant( schemes.banded.layouts(), function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.triangularBanded( sc, rng, N, kd, { 'uplo': uplo, 'unit': unit } );
			var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd, 'unit': unit }, layout );
			var RCOND = new Float64Array( 1 );
			var WORK = new Complex128Array( 2 * N );
			var RWORK = new Float64Array( N );
			ztbcon( nm.api, uplo, diag, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], RCOND, WORK, 1, 0, RWORK, 1, 0 );
			return [ RCOND[ 0 ] ];
		}, { 'label': 'ztbcon ' + nm.api + ' ' + uplo + ' ' + diag + ' layout invariance' } );
	} );
}
