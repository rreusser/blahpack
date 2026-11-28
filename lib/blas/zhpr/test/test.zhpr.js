/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpr from './../lib/zhpr.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Asserts that two complex arrays are element-wise identical.
*
* @private
* @param {Complex128Array} actual - actual value
* @param {Complex128Array} expected - expected value
* @param {string} msg - assertion message
*/
function assertSame( actual, expected, msg ) {
	const a = reinterpret( actual, 0 );
	const e = reinterpret( expected, 0 );
	let i;
	assert.strictEqual( a.length, e.length, msg + ': length' );
	for ( i = 0; i < e.length; i++ ) {
		assert.strictEqual( a[ i ], e[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zhpr is a function', function t() {
	assert.strictEqual( typeof zhpr, 'function', 'is a function' );
});

test( 'zhpr has expected arity', function t() {
	assert.strictEqual( zhpr.length, 7, 'has expected arity' );
});

test( 'zhpr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpr( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpr( 'column-major', 'upper', -1, 2, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhpr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpr( 'invalid', 'upper', 2, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpr throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zhpr( 'column-major', 'upper', 2, 1.0, new Complex128Array( 2 ), 0, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpr throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zhpr( 'row-major', 'upper', 2, 1.0, new Complex128Array( 2 ), 1, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpr (column-major) matches strided for both uplo and positive/negative strides', function t() {
	const APv = [ 4, 0, 1, 2, 5, 0, -1, 1, 2, -3, 6, 0 ];
	const x = new Complex128Array( new Float64Array( [ 1, -1, 0, 0, 2, 0.5, 0, 0, -3, 1, 0, 0 ] ) ); // eslint-disable-line max-len
	const uplos = [ 'upper', 'lower' ];
	const strides = [ 2, -2 ];
	let AP1;
	let AP2;
	let sx;
	let i;
	let j;
	for ( i = 0; i < uplos.length; i++ ) {
		for ( j = 0; j < strides.length; j++ ) {
			sx = strides[ j ];
			AP1 = new Complex128Array( new Float64Array( APv ) );
			AP2 = new Complex128Array( new Float64Array( APv ) );
			zhpr( 'column-major', uplos[ i ], 3, 1.5, x, sx, AP1 );
			strided( uplos[ i ], 3, 1.5, x, sx, ( sx < 0 ) ? 4 : 0, AP2, 1, 0 ); // eslint-disable-line max-len
			assertSame( AP1, AP2, uplos[ i ] + ' sx=' + sx );
			assert.notDeepStrictEqual( Array.from( reinterpret( AP1, 0 ) ), APv, 'AP was updated' ); // eslint-disable-line max-len
		}
	}
});
