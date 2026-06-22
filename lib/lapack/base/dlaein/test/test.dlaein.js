
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaein from './../lib/dlaein.js';


// TESTS //

test( 'dlaein is a function', function t() {
	assert.strictEqual( typeof dlaein, 'function', 'is a function' );
});

test( 'dlaein has expected arity', function t() {
	assert.strictEqual( dlaein.length, 19, 'has expected arity' );
});

test( 'dlaein throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaein( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dlaein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaein( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
