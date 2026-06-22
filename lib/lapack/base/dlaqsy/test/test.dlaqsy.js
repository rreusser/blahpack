/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsy from './../lib/dlaqsy.js';


// TESTS //

test( 'dlaqsy is a function', function t() {
	assert.strictEqual( typeof dlaqsy, 'function', 'is a function' );
});

test( 'dlaqsy has expected arity', function t() {
	assert.strictEqual( dlaqsy.length, 8, 'has expected arity' );
});

test( 'dlaqsy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlaqsy( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, TypeError );
});

test( 'dlaqsy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqsy( 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, RangeError );
});
