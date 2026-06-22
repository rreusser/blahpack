/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatdf from './../lib/dlatdf.js';


// TESTS //

test( 'dlatdf is a function', function t() {
	assert.strictEqual( typeof dlatdf, 'function', 'is a function' );
});

test( 'dlatdf has expected arity', function t() {
	assert.strictEqual( dlatdf.length, 12, 'has expected arity' );
});

test( 'dlatdf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatdf( 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
