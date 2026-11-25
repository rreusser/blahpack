/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zhpr2 from './../lib/zhpr2.js';
import ndarray from './../lib/ndarray.js';


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

test( 'zhpr2 is a function', function t() {
	assert.strictEqual( typeof zhpr2, 'function', 'is a function' );
});

test( 'zhpr2 has expected arity', function t() {
	assert.strictEqual( zhpr2.length, 9, 'has expected arity' );
});

test( 'zhpr2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpr2( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpr2( 'column-major', 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhpr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpr2( 'invalid', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpr2 throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zhpr2( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 2 ), 0, new Complex128Array( 2 ), 1, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpr2 throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		zhpr2( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 0, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpr2 throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zhpr2( 'row-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpr2 (column-major) matches ndarray for both uplo and positive/negative strides', function t() {
	const alpha = new Complex128( 0.5, -1.5 );
	const APv = [ 4, 0, 1, 2, 5, 0, -1, 1, 2, -3, 6, 0 ];
	const x = new Complex128Array( new Float64Array( [ 1, -1, 0, 0, 2, 0.5, 0, 0, -3, 1, 0, 0 ] ) ); // eslint-disable-line max-len
	const y = new Complex128Array( new Float64Array( [ 0.5, 1, 0, 0, -1, 2, 0, 0, 3, -0.5, 0, 0 ] ) ); // eslint-disable-line max-len
	const strides = [ [ 2, 2 ], [ -2, 2 ], [ 2, -2 ] ];
	const uplos = [ 'upper', 'lower' ];
	let AP1;
	let AP2;
	let sx;
	let sy;
	let i;
	let j;
	for ( i = 0; i < uplos.length; i++ ) {
		for ( j = 0; j < strides.length; j++ ) {
			sx = strides[ j ][ 0 ];
			sy = strides[ j ][ 1 ];
			AP1 = new Complex128Array( new Float64Array( APv ) );
			AP2 = new Complex128Array( new Float64Array( APv ) );
			zhpr2( 'column-major', uplos[ i ], 3, alpha, x, sx, y, sy, AP1 );
			ndarray( uplos[ i ], 3, alpha, x, sx, ( sx < 0 ) ? 4 : 0, y, sy, ( sy < 0 ) ? 4 : 0, AP2, 1, 0 ); // eslint-disable-line max-len
			assertSame( AP1, AP2, uplos[ i ] + ' sx=' + sx + ' sy=' + sy );
			assert.notDeepStrictEqual( Array.from( reinterpret( AP1, 0 ) ), APv, 'AP was updated' ); // eslint-disable-line max-len
		}
	}
});
