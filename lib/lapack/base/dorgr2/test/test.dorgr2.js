

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgr2 from './../lib/dorgr2.js';


// TESTS //

test( 'dorgr2 is a function', function t() {
	assert.strictEqual( typeof dorgr2, 'function', 'is a function' );
});

test( 'dorgr2 has expected arity', function t() {
	assert.strictEqual( dorgr2.length, 10, 'has expected arity' );
});

test( 'dorgr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgr2( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dorgr2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgr2( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dorgr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgr2( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dorgr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgr2( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

