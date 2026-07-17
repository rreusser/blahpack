/**
* Property-based validation for zgecon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `con` (condition-number ESTIMATOR from an LU
* factor) -> PROPERTY: zgecon returns `rcond ≈ 1/κ` where κ = ‖A‖·‖A⁻¹‖ in the
* chosen norm. It is a Hager/Higham estimate (a lower bound on ‖A⁻¹‖, hence an
* upper bound on true_rcond), guaranteed within a factor ~N and usually much
* tighter. We compute the TRUE value INDEPENDENTLY: anorm = exact 1-/inf-norm of
* A0; ‖A⁻¹‖ from A⁻¹ obtained by solving A0·X = I with the already-validated
* zgesv (independent of zgecon's zlacn2 estimator). Assert agreement within a
* modest factor F and rcond ∈ (0,1].
*
* NOTE: unlike the real dgecon, zgecon's second workspace is a REAL RWORK
* (Float64Array, length 2N) — NOT an integer IWORK; WORK is a Complex128Array of
* length 2N.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgecon from './../lib/ndarray.js';
import zgetrf from '../../zgetrf/lib/ndarray.js';
import zgesv from '../../zgesv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var NORMS = [
	{ 'api': 'one-norm', 'which': 'one' },
	{ 'api': 'inf-norm', 'which': 'inf' }
];
var FACTOR = 3;
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

function identity( n ) {
	var M = new LogicalMatrix( sc, n, n ); // inits to sc.zero
	var i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

function readFull( R, rows, cols ) {
	var M = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

// INDEPENDENT true inverse: solve A0·X = I with zgesv (X = A0⁻¹).
function generalInverse( A0, n ) {
	var Ac = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	var Bc = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( n );
	zgesv( n, n, Ac.data, Ac.args[ 0 ], Ac.args[ 1 ], Ac.args[ 2 ], ipiv, 1, 0, Bc.data, Bc.args[ 0 ], Bc.args[ 1 ], Bc.args[ 2 ] );
	return readFull( Bc, n, n );
}

test( 'zgecon: rcond ≈ 1/κ vs independent truth (norm x N)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			runProperty( nm, N );
		});
	});
});

function runProperty( nm, N ) {
	var rng = new RNG( 0x100 + N ); // reproducible; log on failure
	var A0 = logical.general( sc, rng, N, N );
	var anorm = normOf( A0, nm.which );

	// Estimator: factor a fresh realized copy of A0, then estimate rcond.
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( N );
	zgetrf( N, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );

	var rcond = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * N );
	var RWORK = new Float64Array( 2 * N );
	var info = zgecon( nm.api, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );

	// Independent truth:
	var Ainv = generalInverse( A0, N );
	var invnorm = normOf( Ainv, nm.which );
	var trueRcond = 1.0 / ( anorm * invnorm );

	var label = 'zgecon ' + nm.api + ' N=' + N;
	checked( 'zgecon', 'property', function run() {
		if ( info !== 0 ) {
			throw new Error( label + ': info=' + info + ' (expected 0)' );
		}
		var r = rcond[ 0 ];
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( label + ': rcond=' + r + ' not in (0,1]' );
		}
		if ( !( r <= FACTOR * trueRcond && trueRcond <= FACTOR * r ) ) {
			throw new Error( label + ': rcond=' + r.toExponential( 4 ) + ' disagrees with true_rcond=' + trueRcond.toExponential( 4 ) + ' beyond factor ' + FACTOR + ' (ratio ' + ( r / trueRcond ).toExponential( 3 ) + ')' );
		}
	} );
}

// Step 4: layout-invariance. Pre-factor ONCE, then re-realize the FIXED factor at
// every dense layout and run only zgecon (fixed anorm). No pivot search of its
// own; inner zlatrs/zlacn2 read A(i,j) by value -> bit-exact across ALL 7 layouts.
function readFac( R, n ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

test( 'zgecon: bit-exact across all storage layouts (estimate isolated from factor)', function t() {
	NORMS.forEach( function eachNorm( nm ) {
		runInvariance( nm );
	});
});

function runInvariance( nm ) {
	var N = 9;
	var SEED = 0x100 + N;
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, N, N );
	var anorm = normOf( A0, nm.which );

	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( N );
	zgetrf( N, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	var Afac = readFac( Af, N );

	checked( 'zgecon', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.layouts(), function build( layout ) {
			var Ar = schemes.dense.realize( sc, Afac, { 'part': 'full' }, layout );
			var rcond = new Float64Array( 1 );
			var WORK = new Complex128Array( 2 * N );
			var RWORK = new Float64Array( 2 * N );
			zgecon( nm.api, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
			return [ rcond[ 0 ] ];
		}, { 'label': 'zgecon ' + nm.api + ' layout invariance' } );
	} );
}
