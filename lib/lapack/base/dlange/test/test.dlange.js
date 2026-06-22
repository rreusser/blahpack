/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlange from './../lib/dlange.js';


// TESTS //

test( 'dlange is a function', function t() {
	assert.strictEqual( typeof dlange, 'function', 'is a function' );
});

test( 'dlange has expected arity', function t() {
	assert.strictEqual( dlange.length, 8, 'has expected arity' );
});

test( 'dlange throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlange( 'invalid', 'max', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlange throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlange( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlange throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlange( 'row-major', 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlange throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlange( 'row-major', 'max', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
