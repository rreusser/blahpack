/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dppcon from './../lib/dppcon.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dppcon is a function', function t() {
	assert.strictEqual( typeof dppcon, 'function', 'is a function' );
});

test( 'dppcon has expected arity', function t() {
	assert.strictEqual( dppcon.length, 8, 'has expected arity' );
});

test( 'dppcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dppcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dppcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dppcon( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dppcon throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dppcon( 'row-major', 'upper', 2, new Float64Array( 3 ), 1.0, new Float64Array( 1 ), null, null );
	}, TypeError );
});

test( 'dppcon throws RangeError for negative anorm', function t() {
	assert.throws( function throws() {
		dppcon( 'column-major', 'upper', 2, new Float64Array( 3 ), -1.0, new Float64Array( 1 ), null, null );
	}, RangeError );
});

/**
* Builds a packed triangular Cholesky factor of order `N`.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} packed factor
*/
function factor( N ) {
	const n = ( N * ( N + 1 ) ) / 2;
	const AP = new Float64Array( n );
	let k = 0;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			// Packed triangle (works for either `uplo`; diagonal is dominant):
			AP[ k ] = ( i === j ) ? 3.0 + ( 0.5 * j ) : 0.3 * Math.sin( k + 1 );
			k += 1;
		}
	}
	return AP;
}

test( 'dppcon matches ndarray (column-major), with given and null workspace', function t() {
	const uplos = [ 'upper', 'lower' ];
	const N = 5;
	const anorm = 7.5;
	let rcond1;
	let rcond2;
	let rcond3;
	let info1;
	let info2;
	let info3;
	let AP;
	let k;
	for ( k = 0; k < uplos.length; k++ ) {
		AP = factor( N );
		rcond1 = new Float64Array( 1 );
		rcond2 = new Float64Array( 1 );
		rcond3 = new Float64Array( 1 );
		info1 = dppcon( 'column-major', uplos[ k ], N, AP, anorm, rcond1, new Float64Array( 3 * N ), new Int32Array( N ) );
		info2 = dppcon( 'column-major', uplos[ k ], N, AP, anorm, rcond2, null, null );
		info3 = ndarray( uplos[ k ], N, AP, 1, 0, anorm, rcond3, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
		assert.strictEqual( info1, 0, 'info' );
		assert.strictEqual( info2, 0, 'info (null workspace)' );
		assert.strictEqual( info3, 0, 'info (ndarray)' );
		assert.ok( rcond3[ 0 ] > 0.0 && rcond3[ 0 ] < Infinity, 'rcond is positive and finite' );
		assert.strictEqual( rcond1[ 0 ], rcond3[ 0 ], uplos[ k ] + ' rcond matches ndarray' );
		assert.strictEqual( rcond2[ 0 ], rcond3[ 0 ], uplos[ k ] + ' rcond (null workspace) matches ndarray' );
	}
});

test( 'dppcon returns rcond = 1 for N=1 when anorm = u^2', function t() {
	// A = u^H u = [4], so ||A|| * ||inv(A)|| = 4 * (1/4) = 1:
	const rcond = new Float64Array( 1 );
	const info = dppcon( 'column-major', 'upper', 1, new Float64Array( [ 2.0 ] ), 4.0, rcond, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) <= 1e-15, 'rcond is 1' );
});
