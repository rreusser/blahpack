/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerq2 from './../lib/dgerq2.js';


// TESTS //

test( 'dgerq2 is a function', function t() {
	assert.strictEqual( typeof dgerq2, 'function', 'is a function' );
});

test( 'dgerq2 has expected arity', function t() {
	assert.strictEqual( dgerq2.length, 8, 'has expected arity' );
});

test( 'dgerq2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgerq2( -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgerq2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgerq2( new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
