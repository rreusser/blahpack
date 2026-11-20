/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsb from './../lib/zlaqsb.js';


// TESTS //

test( 'zlaqsb is a function', function t() {
	assert.strictEqual( typeof zlaqsb, 'function', 'is a function' );
});

test( 'zlaqsb has expected arity', function t() {
	assert.strictEqual( zlaqsb.length, 11, 'has expected arity' );
});

test( 'zlaqsb throws TypeError for an invalid order', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsb( 'foo', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsb throws TypeError for an invalid uplo', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsb( 'column-major', 'invalid', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsb throws RangeError for negative N', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsb( 'column-major', 'upper', -1, 1, AB, 2, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqsb returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqsb writes \'yes\' to equed when scaling is applied', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
