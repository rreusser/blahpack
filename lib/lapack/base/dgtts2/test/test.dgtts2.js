/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgtts2 from './../lib/dgtts2.js';


// TESTS //

test( 'dgtts2 is a function', function t() {
	assert.strictEqual( typeof dgtts2, 'function', 'is a function' );
});

test( 'dgtts2 has expected arity', function t() {
	assert.strictEqual( dgtts2.length, 15, 'has expected arity' );
});

test( 'dgtts2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgtts2( 2, -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgtts2 throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgtts2( 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
