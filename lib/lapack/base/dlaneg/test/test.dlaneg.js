/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaneg from './../lib/dlaneg.js';


// TESTS //

test( 'dlaneg is a function', function t() {
	assert.strictEqual( typeof dlaneg, 'function', 'is a function' );
});

test( 'dlaneg has expected arity', function t() {
	assert.strictEqual( dlaneg.length, 8, 'has expected arity' );
});

test( 'dlaneg throws a RangeError for a negative N', function t() {
	var LLD;
	var d;
	d = new Float64Array( [ 2.0 ] );
	LLD = new Float64Array( [ 0.0 ] );
	assert.throws( function throws() {
		dlaneg( -1, d, 1, LLD, 1, 0.0, 1.0e-30, 1 );
	}, RangeError );
});

test( 'dlaneg returns an integer for N=1', function t() {
	var LLD;
	var out;
	var d;
	d = new Float64Array( [ 2.0 ] );
	LLD = new Float64Array( [ 0.0 ] );
	out = dlaneg( 1, d, 1, LLD, 1, 0.0, 1.0e-30, 1 );
	assert.strictEqual( out, 0, 'returns 0 when sigma < d[0]' );
});

test( 'dlaneg returns 1 for N=1 when sigma exceeds d[0]', function t() {
	var LLD;
	var out;
	var d;
	d = new Float64Array( [ 2.0 ] );
	LLD = new Float64Array( [ 0.0 ] );
	out = dlaneg( 1, d, 1, LLD, 1, 5.0, 1.0e-30, 1 );
	assert.strictEqual( out, 1, 'returns 1' );
});
