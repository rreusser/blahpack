/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqp2 from './../lib/dlaqp2.js';


// TESTS //

test( 'dlaqp2 is a function', function t() {
	assert.strictEqual( typeof dlaqp2, 'function', 'is a function' );
});

test( 'dlaqp2 has expected arity', function t() {
	assert.strictEqual( dlaqp2.length, 15, 'has expected arity' );
});

test( 'dlaqp2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaqp2( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlaqp2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqp2( new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
