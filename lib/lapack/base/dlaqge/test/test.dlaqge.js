/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqge from './../lib/dlaqge.js';


// TESTS //

test( 'dlaqge is a function', function t() {
	assert.strictEqual( typeof dlaqge, 'function', 'is a function' );
});

test( 'dlaqge has expected arity', function t() {
	assert.strictEqual( dlaqge.length, 12, 'has expected arity' );
});

test( 'dlaqge throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaqge( 'column-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});

test( 'dlaqge throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqge( 'column-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});
