/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpttrf from './../lib/dpttrf.js';


// TESTS //

test( 'dpttrf is a function', function t() {
	assert.strictEqual( typeof dpttrf, 'function', 'is a function' );
});

test( 'dpttrf has expected arity', function t() {
	assert.strictEqual( dpttrf.length, 5, 'has expected arity' );
});

test( 'dpttrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpttrf( -1, 2, 1, 2, 1 );
	}, RangeError );
});
