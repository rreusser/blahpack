/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlassq from './../lib/dlassq.js';


// TESTS //

test( 'dlassq is a function', function t() {
	assert.strictEqual( typeof dlassq, 'function', 'is a function' );
});

test( 'dlassq has expected arity', function t() {
	assert.strictEqual( dlassq.length, 5, 'has expected arity' );
});

test( 'dlassq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlassq( -1, 2, 1, 2, 2 );
	}, RangeError );
});
