/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr1 from './../lib/dlaqr1.js';


// TESTS //

test( 'dlaqr1 is a function', function t() {
	assert.strictEqual( typeof dlaqr1, 'function', 'is a function' );
});

test( 'dlaqr1 has expected arity', function t() {
	assert.strictEqual( dlaqr1.length, 9, 'has expected arity' );
});

test( 'dlaqr1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqr1( -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 1 );
	}, RangeError );
});
