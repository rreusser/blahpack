/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapmt from './../lib/dlapmt.js';


// TESTS //

test( 'dlapmt is a function', function t() {
	assert.strictEqual( typeof dlapmt, 'function', 'is a function' );
});

test( 'dlapmt has expected arity', function t() {
	assert.strictEqual( dlapmt.length, 8, 'has expected arity' );
});

test( 'dlapmt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlapmt( 'column-major', 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'dlapmt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlapmt( 'column-major', 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
