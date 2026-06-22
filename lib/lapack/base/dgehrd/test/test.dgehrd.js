/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgehrd from './../lib/dgehrd.js';


// TESTS //

test( 'dgehrd is a function', function t() {
	assert.strictEqual( typeof dgehrd, 'function', 'is a function' );
});

test( 'dgehrd has expected arity', function t() {
	assert.strictEqual( dgehrd.length, 10, 'has expected arity' );
});

test( 'dgehrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgehrd( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgehrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgehrd( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
