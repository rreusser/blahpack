/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggqrf from './../lib/dggqrf.js';


// TESTS //

test( 'dggqrf is a function', function t() {
	assert.strictEqual( typeof dggqrf, 'function', 'is a function' );
});

test( 'dggqrf has expected arity', function t() {
	assert.strictEqual( dggqrf.length, 14, 'has expected arity' );
});

test( 'dggqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggqrf( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dggqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggqrf( new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
