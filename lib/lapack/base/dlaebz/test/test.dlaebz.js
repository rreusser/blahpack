/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaebz from './../lib/dlaebz.js';


// TESTS //

test( 'dlaebz is a function', function t() {
	assert.strictEqual( typeof dlaebz, 'function', 'is a function' );
});

test( 'dlaebz has expected arity', function t() {
	assert.strictEqual( dlaebz.length, 28, 'has expected arity' );
});

test( 'dlaebz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaebz( 2, 2, -1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
