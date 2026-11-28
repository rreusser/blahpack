/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpsv from './../lib/ztpsv.js';
import ztpsvStrided from './../lib/strided.js';


// TESTS //

test( 'ztpsv is a function', function t() {
	assert.strictEqual( typeof ztpsv, 'function', 'is a function' );
});

test( 'ztpsv has expected arity', function t() {
	assert.strictEqual( ztpsv.length, 8, 'has expected arity' );
});

test( 'ztpsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpsv( 'column-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ztpsv( 'column-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpsv( 'column-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'ztpsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpsv( 'column-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, 1 );
	}, RangeError );
});

test( 'ztpsv throws TypeError for row-major order (packed storage is column-major only)', function t() {
	const AP = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 3.0, 0.5 ] );
	const x = new Complex128Array( [ 1.0, 2.0, -1.0, 0.5 ] );
	assert.throws( function throws() {
		ztpsv( 'row-major', 'upper', 'no-transpose', 'non-unit', 2, AP, x, 1 );
	}, TypeError );
});

test( 'ztpsv column-major matches strided (negative stride)', function t() {
	const AP = new Complex128Array( [ 2.0, 1.0, 1.0, -1.0, 3.0, 0.5, 0.5, 0.25, -1.0, 2.0, 4.0, -1.0 ] );
	const x1 = new Complex128Array( [ 1.0, 2.0, 0.0, 0.0, -1.0, 0.5, 0.0, 0.0, 3.0, -2.0 ] );
	const x2 = new Complex128Array( x1 );
	const out = ztpsv( 'column-major', 'upper', 'conjugate-transpose', 'non-unit', 3, AP, x1, -2 );
	ztpsvStrided( 'upper', 'conjugate-transpose', 'non-unit', 3, AP, 1, 0, x2, -2, 4 );
	const v1 = reinterpret( x1, 0 );
	const v2 = reinterpret( x2, 0 );
	let i;
	assert.strictEqual( out, x1, 'returns x' );
	for ( i = 0; i < v1.length; i++ ) {
		assert.strictEqual( v1[ i ], v2[ i ], 'element ' + i );
	}
	assert.notStrictEqual( v1[ 0 ], 1.0, 'x was modified' );
});
