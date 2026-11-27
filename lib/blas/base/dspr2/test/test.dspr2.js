/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr2 from './../lib/dspr2.js';
import dspr2Nd from './../lib/ndarray.js';


// TESTS //

test( 'dspr2 is a function', function t() {
	assert.strictEqual( typeof dspr2, 'function', 'is a function' );
});

test( 'dspr2 has expected arity', function t() {
	assert.strictEqual( dspr2.length, 9, 'has expected arity' );
});

test( 'dspr2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspr2( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspr2( 'column-major', 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dspr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspr2( 'invalid', 'upper', 2, 1.0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspr2 throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		dspr2( 'column-major', 'upper', 2, 1.0, new Float64Array( 2 ), 0, new Float64Array( 2 ), 1, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dspr2 throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		dspr2( 'column-major', 'upper', 2, 1.0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 0, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dspr2 throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dspr2( 'row-major', 'upper', 2, 1.0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspr2 (column-major) matches ndarray for both triangles and positive/negative strides', function t() {
	const xdata = [ 1.0, -2.0, 0.5, 3.0, 1.5, -0.25, 2.0, 0.75 ];
	const ydata = [ 0.3, 1.1, -0.7, 2.4, -1.6, 0.9, 0.2, -0.4 ];
	const apdata = [ 4.0, 1.0, 3.0, -2.0, 0.5, 5.0, 1.5, -1.0, 2.0, 6.0 ];
	const cases = [
		[ 'upper', 1, 1 ], [ 'lower', 1, 1 ], [ 'upper', -2, 1 ], [ 'lower', 2, -1 ]
	];
	let APe;
	let APa;
	let out;
	let sx;
	let sy;
	let N;
	let i;
	let k;
	N = 4;
	for ( k = 0; k < cases.length; k += 1 ) {
		sx = cases[ k ][ 1 ];
		sy = cases[ k ][ 2 ];
		APa = new Float64Array( apdata );
		APe = new Float64Array( apdata );
		out = dspr2( 'column-major', cases[ k ][ 0 ], N, 1.25, new Float64Array( xdata ), sx, new Float64Array( ydata ), sy, APa );
		assert.strictEqual( out, APa );
		dspr2Nd( cases[ k ][ 0 ], N, 1.25, new Float64Array( xdata ), sx, ( sx < 0 ) ? ( 1 - N ) * sx : 0, new Float64Array( ydata ), sy, ( sy < 0 ) ? ( 1 - N ) * sy : 0, APe, 1, 0 );
		for ( i = 0; i < APe.length; i += 1 ) {
			assert.strictEqual( APa[ i ], APe[ i ], cases[ k ].join( ',' ) + ' AP[' + i + ']' );
		}
		assert.notStrictEqual( APa[ 0 ], apdata[ 0 ] );
	}
});
