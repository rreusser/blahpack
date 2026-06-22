/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqps from './../lib/dlaqps.js';


// TESTS //

test( 'dlaqps is a function', function t() {
	assert.strictEqual( typeof dlaqps, 'function', 'is a function' );
});

test( 'dlaqps has expected arity', function t() {
	assert.strictEqual( dlaqps.length, 18, 'has expected arity' );
});

test( 'dlaqps throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaqps( -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlaqps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqps( new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
