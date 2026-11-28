/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztptri from './../lib/ztptri.js';


// TESTS //

test( 'ztptri is a function', function t() {
	assert.strictEqual( typeof ztptri, 'function', 'is a function' );
});

test( 'ztptri has expected arity', function t() {
	assert.strictEqual( ztptri.length, 5, 'has expected arity' );
});

test( 'ztptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztptri( 'column-major', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztptri throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztptri( 'column-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztptri( 'column-major', 'upper', 'non-unit', -1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'ztptri throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Complex128Array( [ 2.0, 1.0, 1.0, 0.5, 3.0, -1.0, 4.0, 0.0, 5.0, 2.0, 6.0, 1.0 ] );
	const orig = new Float64Array( reinterpret( AP, 0 ) );
	assert.throws( function throws() {
		ztptri( 'row-major', 'upper', 'non-unit', 3, AP );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( reinterpret( AP, 0 ), orig, 'AP unchanged' );
});
