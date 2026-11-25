/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpttf from './../lib/ztpttf.js';


// TESTS //

test( 'ztpttf is a function', function t() {
	assert.strictEqual( typeof ztpttf, 'function', 'is a function' );
});

test( 'ztpttf has expected arity', function t() {
	assert.strictEqual( ztpttf.length, 7, 'has expected arity' );
});

test( 'ztpttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpttf( 'column-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'ztpttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpttf( 'column-major', 'conjugate-transpose', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'ztpttf throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Complex128Array( [ 2.0, 1.0, 1.0, 0.5, 3.0, -1.0, 4.0, 0.0, 5.0, 2.0, 6.0, 1.0 ] );
	const ARF = new Complex128Array( 6 );
	const orig = new Float64Array( reinterpret( AP, 0 ) );
	assert.throws( function throws() {
		ztpttf( 'row-major', 'no-transpose', 'upper', 3, AP, ARF, 1 );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( reinterpret( AP, 0 ), orig, 'AP unchanged' );
	assert.deepStrictEqual( reinterpret( ARF, 0 ), new Float64Array( 12 ), 'ARF unchanged' );
});
