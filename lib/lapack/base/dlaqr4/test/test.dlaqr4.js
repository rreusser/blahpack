/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr4 from './../lib/dlaqr4.js';


// TESTS //

test( 'dlaqr4 is a function', function t() {
	assert.strictEqual( typeof dlaqr4, 'function', 'is a function' );
});

test( 'dlaqr4 has expected arity', function t() {
	assert.strictEqual( dlaqr4.length, 18, 'has expected arity' );
});

test( 'dlaqr4 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqr4( 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
