/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zhpmv from './../lib/zhpmv.js';
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

test( 'zhpmv is a function', function t() {
	assert.strictEqual( typeof zhpmv, 'function', 'is a function' );
});

test( 'zhpmv has expected arity', function t() {
	assert.strictEqual( zhpmv.length, 10, 'has expected arity' );
});

test( 'zhpmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpmv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhpmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpmv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zhpmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpmv( 'invalid', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpmv throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zhpmv( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 0, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpmv throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		zhpmv( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpmv throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zhpmv( 'row-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpmv (column-major) matches strided for both uplo and positive/negative strides', function t() {
	const alpha = new Complex128( 0.5, -1.5 );
	const beta = new Complex128( 2.0, 0.25 );
	const AP = new Complex128Array( new Float64Array( [ 4, 0, 1, 2, 5, 0, -1, 1, 2, -3, 6, 0 ] ) ); // eslint-disable-line max-len
	const xv = [ 1, -1, 0, 0, 2, 0.5, 0, 0, -3, 1, 0, 0 ];
	const yv = [ 0.5, 1, 0, 0, -1, 2, 0, 0, 3, -0.5, 0, 0 ];
	const strides = [ [ 2, 2 ], [ -2, 2 ], [ 2, -2 ] ];
	const uplos = [ 'upper', 'lower' ];
	let y1;
	let y2;
	let sx;
	let sy;
	let x;
	let i;
	let j;
	for ( i = 0; i < uplos.length; i++ ) {
		for ( j = 0; j < strides.length; j++ ) {
			sx = strides[ j ][ 0 ];
			sy = strides[ j ][ 1 ];
			x = new Complex128Array( new Float64Array( xv ) );
			y1 = new Complex128Array( new Float64Array( yv ) );
			y2 = new Complex128Array( new Float64Array( yv ) );
			zhpmv( 'column-major', uplos[ i ], 3, alpha, AP, x, sx, beta, y1, sy );
			strided( uplos[ i ], 3, alpha, AP, 1, 0, x, sx, ( sx < 0 ) ? 4 : 0, beta, y2, sy, ( sy < 0 ) ? 4 : 0 ); // eslint-disable-line max-len
			assertSame( y1, y2, uplos[ i ] + ' sx=' + sx + ' sy=' + sy );
			assert.notDeepStrictEqual( Array.from( reinterpret( y1, 0 ) ), yv, 'y was updated' ); // eslint-disable-line max-len
		}
	}
});
