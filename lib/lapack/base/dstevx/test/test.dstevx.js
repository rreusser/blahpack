/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstevx from './../lib/dstevx.js';


// TESTS //

test( 'dstevx is a function', function t() {
	assert.strictEqual( typeof dstevx, 'function', 'is a function' );
});

test( 'dstevx has expected arity', function t() {
	assert.strictEqual( dstevx.length, 23, 'has expected arity' );
});

test( 'dstevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstevx( 2, 2, -1, 2, 1, 2, 1, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstevx throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dstevx( 2, 2, new Float64Array( 4 ), 2, 1, 2, 1, 2, 2, 2, 2, 2, -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
