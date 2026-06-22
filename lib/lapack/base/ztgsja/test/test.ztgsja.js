/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztgsja from './../lib/ztgsja.js';


// TESTS //

test( 'ztgsja is a function', function t() {
	assert.strictEqual( typeof ztgsja, 'function', 'is a function' );
});

test( 'ztgsja has expected arity', function t() {
	assert.strictEqual( ztgsja.length, 24, 'has expected arity' );
});

test( 'ztgsja throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztgsja( 2, 2, 2, -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztgsja throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgsja( 2, 2, 2, new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztgsja throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		ztgsja( 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
