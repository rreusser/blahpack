/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_porpvgrw from './../lib/dla_porpvgrw.js';


// TESTS //

test( 'dla_porpvgrw is a function', function t() {
	assert.strictEqual( typeof dla_porpvgrw, 'function', 'is a function' );
});

test( 'dla_porpvgrw has expected arity', function t() {
	assert.strictEqual( dla_porpvgrw.length, 7, 'has expected arity' );
});

test( 'dla_porpvgrw throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dla_porpvgrw( 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});
