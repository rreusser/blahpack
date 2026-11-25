/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zspmv from './../lib/zspmv.js';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zspmv is a function', function t() {
	assert.strictEqual( typeof zspmv, 'function', 'is a function' );
});

test( 'zspmv has expected arity', function t() {
	assert.strictEqual( zspmv.length, 10, 'has expected arity' );
});

test( 'zspmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspmv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zspmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspmv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zspmv throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		zspmv( 'row-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zspmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zspmv( 'invalid', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zspmv throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		zspmv( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 0, new Complex128( 0, 0 ), new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zspmv throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		zspmv( 'column-major', 'upper', 2, new Complex128( 1, 0 ), new Complex128Array( 3 ), new Complex128Array( 2 ), 1, new Complex128( 0, 0 ), new Complex128Array( 2 ), 0 );
	}, RangeError );
});

test( 'zspmv (column-major) matches ndarray, including negative strides', function t() {
	const strides = [ [ 1, 1 ], [ 2, -1 ], [ -2, 2 ] ];
	const uplos = [ 'upper', 'lower' ];
	const alpha = new Complex128( 0.5, -1.5 );
	const beta = new Complex128( 2, 0.25 );
	let ye, yw, ve, vw, sx, sy, ox, oy, AP, x, u, s, i;
	for ( u = 0; u < uplos.length; u++ ) {
		for ( s = 0; s < strides.length; s++ ) {
			sx = strides[ s ][ 0 ];
			sy = strides[ s ][ 1 ];
			AP = new Complex128Array( [ 2, 1, 1, 1, 4, -1, 3, -2, 2, 1, 5, 3 ] );
			x = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, -1, 2, 0.5, 0.5, 4, -2 ] );
			ye = new Complex128Array( [ 1, -1, 2, 0, -3, 1, 0.5, 2, 1, 1, -2, 3 ] );
			yw = new Complex128Array( reinterpret( ye, 0 ) );
			ox = ( sx < 0 ) ? -2 * sx : 0;
			oy = ( sy < 0 ) ? -2 * sy : 0;
			ndarray( uplos[ u ], 3, alpha, AP, 1, 0, x, sx, ox, beta, ye, sy, oy );
			zspmv( 'column-major', uplos[ u ], 3, alpha, AP, x, sx, beta, yw, sy );
			ve = reinterpret( ye, 0 );
			vw = reinterpret( yw, 0 );
			for ( i = 0; i < ve.length; i++ ) {
				assert.equal( vw[ i ], ve[ i ], uplos[ u ] + ' strides ' + sx + ',' + sy + ' y[' + i + ']' );
			}
		}
	}
});
