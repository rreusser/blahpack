/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import iladlc from './../lib/iladlc.js';


// TESTS //

test( 'iladlc is a function', function t() {
	assert.strictEqual( typeof iladlc, 'function', 'is a function' );
});

test( 'iladlc has expected arity', function t() {
	assert.strictEqual( iladlc.length, 5, 'has expected arity' );
});

test( 'iladlc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		iladlc( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'iladlc throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		iladlc( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'iladlc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		iladlc( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
