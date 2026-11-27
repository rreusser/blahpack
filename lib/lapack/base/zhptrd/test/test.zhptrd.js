/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrd from './../lib/zhptrd.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zhptrd is a function', function t() {
	assert.strictEqual( typeof zhptrd, 'function', 'is a function' );
});

test( 'zhptrd has expected arity', function t() {
	assert.strictEqual( zhptrd.length, 10, 'has expected arity' );
});

test( 'zhptrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptrd( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhptrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptrd( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zhptrd throws TypeError for row-major order (packed storage is column-major)', function t() {
	assert.throws( function throws() {
		zhptrd( 'row-major', 'upper', 2, new Complex128Array( 3 ), new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, TypeError );
});

test( 'zhptrd (column-major) matches ndarray for both triangles and non-unit strides', function t() {
	const data = [
		[ 4, 0, 1, -1, 2, 0, -2, 1, 0, 0, 3, 0, 2, 0, 1, -1, -2, -1, -1, 0 ],
		[ 4, 0, 1, 1, -2, -1, 2, 0, 2, 0, 0, 0, 1, -1, 3, 0, -2, 1, -1, 0 ]
	];
	const uplos = [ 'upper', 'lower' ];
	let AP1;
	let AP2;
	let TAU1;
	let TAU2;
	let info1;
	let info2;
	let d1;
	let d2;
	let e1;
	let e2;
	let v1;
	let v2;
	let i;
	let k;

	for ( k = 0; k < uplos.length; k++ ) {
		AP1 = new Complex128Array( data[ k ] );
		AP2 = new Complex128Array( data[ k ] );
		d1 = new Float64Array( 8 );
		d2 = new Float64Array( 8 );
		e1 = new Float64Array( 6 );
		e2 = new Float64Array( 6 );
		TAU1 = new Complex128Array( 6 );
		TAU2 = new Complex128Array( 6 );

		// Negative strides exercise the wrapper's stride-to-offset conversion:
		info1 = zhptrd( 'column-major', uplos[ k ], 4, AP1, d1, 2, e1, -2, TAU1, -2 );
		info2 = ndarray( uplos[ k ], 4, AP2, 1, 0, d2, 2, 0, e2, -2, 4, TAU2, -2, 4 );
		assert.strictEqual( info1, 0 );
		assert.strictEqual( info2, 0 );
		assert.deepStrictEqual( d1, d2, uplos[ k ] + ': d' );
		assert.deepStrictEqual( e1, e2, uplos[ k ] + ': e' );
		v1 = reinterpret( TAU1, 0 );
		v2 = reinterpret( TAU2, 0 );
		for ( i = 0; i < v1.length; i++ ) {
			assert.strictEqual( v1[ i ], v2[ i ], uplos[ k ] + ': TAU[' + i + ']' );
		}
		v1 = reinterpret( AP1, 0 );
		v2 = reinterpret( AP2, 0 );
		for ( i = 0; i < v1.length; i++ ) {
			assert.strictEqual( v1[ i ], v2[ i ], uplos[ k ] + ': AP[' + i + ']' );
		}
		// Diagonal of a 4x4 Hermitian matrix: trace is preserved by the similarity transform.
		assert.ok( Math.abs( ( d1[ 0 ] + d1[ 2 ] + d1[ 4 ] + d1[ 6 ] ) - 8.0 ) < 1e-12, uplos[ k ] + ': trace preserved' );
	}
});
