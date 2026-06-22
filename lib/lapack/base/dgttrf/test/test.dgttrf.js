/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgttrf from './../lib/dgttrf.js';


// TESTS //

test( 'dgttrf is a function', function t() {
	assert.strictEqual( typeof dgttrf, 'function', 'is a function' );
});

test( 'dgttrf has expected arity', function t() {
	assert.strictEqual( dgttrf.length, 11, 'has expected arity' );
});

test( 'dgttrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgttrf( -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
