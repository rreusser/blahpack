/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ilazlr from './../lib/ilazlr.js';


// TESTS //

test( 'ilazlr is a function', function t() {
	assert.strictEqual( typeof ilazlr, 'function', 'is a function' );
});

test( 'ilazlr has expected arity', function t() {
	assert.strictEqual( ilazlr.length, 5, 'has expected arity' );
});

test( 'ilazlr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ilazlr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ilazlr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ilazlr( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ilazlr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ilazlr( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
