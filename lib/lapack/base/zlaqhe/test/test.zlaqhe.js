/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqhe from './../lib/zlaqhe.js';


// TESTS //

test( 'zlaqhe is a function', function t() {
	assert.strictEqual( typeof zlaqhe, 'function', 'is a function' );
});

test( 'zlaqhe has expected arity', function t() {
	assert.strictEqual( zlaqhe.length, 10, 'has expected arity' );
});

test( 'zlaqhe throws TypeError for an invalid order', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhe( 'foo', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhe throws TypeError for an invalid uplo', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhe( 'column-major', 'invalid', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhe throws RangeError for negative N', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhe( 'column-major', 'upper', -1, A, 2, s, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqhe returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhe( 'column-major', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqhe writes \'yes\' to equed when scaling is applied', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhe( 'column-major', 'upper', 2, A, 2, s, 1, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
