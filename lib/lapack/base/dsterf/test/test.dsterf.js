/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsterf from './../lib/dsterf.js';


// TESTS //

test( 'dsterf is a function', function t() {
	assert.strictEqual( typeof dsterf, 'function', 'is a function' );
});

test( 'dsterf has expected arity', function t() {
	assert.strictEqual( dsterf.length, 5, 'has expected arity' );
});

test( 'dsterf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsterf( -1, 2, 1, 2, 1 );
	}, RangeError );
});
