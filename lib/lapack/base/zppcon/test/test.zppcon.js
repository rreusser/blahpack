/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zppcon from './../lib/zppcon.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zppcon is a function', function t() {
	assert.strictEqual( typeof zppcon, 'function', 'is a function' );
});

test( 'zppcon has expected arity', function t() {
	assert.strictEqual( zppcon.length, 8, 'has expected arity' );
});

test( 'zppcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zppcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zppcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zppcon( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zppcon throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zppcon( 'row-major', 'upper', 2, new Complex128Array( 3 ), 1.0, new Float64Array( 1 ), null, null );
	}, TypeError );
});

test( 'zppcon throws RangeError for negative anorm', function t() {
	assert.throws( function throws() {
		zppcon( 'column-major', 'upper', 2, new Complex128Array( 3 ), -1.0, new Float64Array( 1 ), null, null );
	}, RangeError );
});

/**
* Builds a packed triangular Cholesky factor of order `N`.
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} packed factor
*/
function factor( N ) {
	const n = ( N * ( N + 1 ) ) / 2;
	const AP = new Complex128Array( n );
	const v = reinterpret( AP, 0 );
	let k = 0;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			// Packed triangle (works for either `uplo`; diagonal is real and dominant):
			if ( i === j ) {
				v[ 2 * k ] = 3.0 + ( 0.5 * j );
				v[ ( 2 * k ) + 1 ] = 0.0;
			} else {
				v[ 2 * k ] = 0.3 * Math.sin( k + 1 );
				v[ ( 2 * k ) + 1 ] = 0.2 * Math.cos( k + j );
			}
			k += 1;
		}
	}
	return AP;
}

test( 'zppcon matches ndarray (column-major), with given and null workspace', function t() {
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
		info1 = zppcon( 'column-major', uplos[ k ], N, AP, anorm, rcond1, new Complex128Array( 2 * N ), new Float64Array( N ) );
		info2 = zppcon( 'column-major', uplos[ k ], N, AP, anorm, rcond2, null, null );
		info3 = ndarray( uplos[ k ], N, AP, 1, 0, anorm, rcond3, new Complex128Array( 2 * N ), 1, 0, new Float64Array( N ), 1, 0 );
		assert.strictEqual( info1, 0, 'info' );
		assert.strictEqual( info2, 0, 'info (null workspace)' );
		assert.strictEqual( info3, 0, 'info (ndarray)' );
		assert.ok( rcond3[ 0 ] > 0.0 && rcond3[ 0 ] < Infinity, 'rcond is positive and finite' );
		assert.strictEqual( rcond1[ 0 ], rcond3[ 0 ], uplos[ k ] + ' rcond matches ndarray' );
		assert.strictEqual( rcond2[ 0 ], rcond3[ 0 ], uplos[ k ] + ' rcond (null workspace) matches ndarray' );
	}
});

test( 'zppcon returns rcond = 1 for N=1 when anorm = u^2', function t() {
	// A = u^H u = [4], so ||A|| * ||inv(A)|| = 4 * (1/4) = 1:
	const rcond = new Float64Array( 1 );
	const info = zppcon( 'column-major', 'upper', 1, new Complex128Array( [ 2.0, 0.0 ] ), 4.0, rcond, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.ok( Math.abs( rcond[ 0 ] - 1.0 ) <= 1e-15, 'rcond is 1' );
});
