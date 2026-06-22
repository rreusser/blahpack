/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansy from './../lib/zlansy.js';


// TESTS //

test( 'zlansy is a function', function t() {
	assert.strictEqual( typeof zlansy, 'function', 'is a function' );
});

test( 'zlansy has expected arity', function t() {
	assert.strictEqual( zlansy.length, 7, 'has expected arity' );
});

test( 'zlansy throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlansy( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlansy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlansy( 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlansy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlansy( 'max', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
