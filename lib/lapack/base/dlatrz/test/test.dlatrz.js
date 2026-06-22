/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrz from './../lib/dlatrz.js';


// TESTS //

test( 'dlatrz is a function', function t() {
	assert.strictEqual( typeof dlatrz, 'function', 'is a function' );
});

test( 'dlatrz has expected arity', function t() {
	assert.strictEqual( dlatrz.length, 10, 'has expected arity' );
});

test( 'dlatrz throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlatrz( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlatrz throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlatrz( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlatrz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatrz( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
