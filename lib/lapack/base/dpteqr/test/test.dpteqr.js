/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpteqr from './../lib/dpteqr.js';


// TESTS //

test( 'dpteqr is a function', function t() {
	assert.strictEqual( typeof dpteqr, 'function', 'is a function' );
});

test( 'dpteqr has expected arity', function t() {
	assert.strictEqual( dpteqr.length, 11, 'has expected arity' );
});

test( 'dpteqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpteqr( 'invalid', 2, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dpteqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpteqr( 'row-major', 2, -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
