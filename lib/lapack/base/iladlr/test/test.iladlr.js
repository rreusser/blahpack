/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import iladlr from './../lib/iladlr.js';


// TESTS //

test( 'iladlr is a function', function t() {
	assert.strictEqual( typeof iladlr, 'function', 'is a function' );
});

test( 'iladlr has expected arity', function t() {
	assert.strictEqual( iladlr.length, 5, 'has expected arity' );
});

test( 'iladlr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		iladlr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'iladlr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		iladlr( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'iladlr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		iladlr( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
