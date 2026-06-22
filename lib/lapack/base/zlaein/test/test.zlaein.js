/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaein from './../lib/zlaein.js';


// TESTS //

test( 'zlaein is a function', function t() {
	assert.strictEqual( typeof zlaein, 'function', 'is a function' );
});

test( 'zlaein has expected arity', function t() {
	assert.strictEqual( zlaein.length, 15, 'has expected arity' );
});

test( 'zlaein throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaein( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2 );
	}, TypeError );
});
