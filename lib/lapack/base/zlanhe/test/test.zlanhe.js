/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhe from './../lib/zlanhe.js';


// TESTS //

test( 'zlanhe is a function', function t() {
	assert.strictEqual( typeof zlanhe, 'function', 'is a function' );
});

test( 'zlanhe has expected arity', function t() {
	assert.strictEqual( zlanhe.length, 8, 'has expected arity' );
});

test( 'zlanhe throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlanhe( 'invalid', 'max', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlanhe throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhe( 'row-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlanhe throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlanhe( 'row-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlanhe throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhe( 'row-major', 'max', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
