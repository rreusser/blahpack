/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeev from './../lib/dgeev.js';


// TESTS //

test( 'dgeev is a function', function t() {
	assert.strictEqual( typeof dgeev, 'function', 'is a function' );
});

test( 'dgeev has expected arity', function t() {
	assert.strictEqual( dgeev.length, 15, 'has expected arity' );
});

test( 'dgeev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgeev( 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, null, 1 );
	}, RangeError );
});
