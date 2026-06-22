/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr3 from './../lib/dlaqr3.js';


// TESTS //

test( 'dlaqr3 is a function', function t() {
	assert.strictEqual( typeof dlaqr3, 'function', 'is a function' );
});

test( 'dlaqr3 has expected arity', function t() {
	assert.strictEqual( dlaqr3.length, 27, 'has expected arity' );
});

test( 'dlaqr3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqr3( 2, 2, -1, 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
