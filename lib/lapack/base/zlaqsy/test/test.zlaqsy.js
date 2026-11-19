/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsy from './../lib/zlaqsy.js';


// TESTS //

test( 'zlaqsy is a function', function t() {
	assert.strictEqual( typeof zlaqsy, 'function', 'is a function' );
});

test( 'zlaqsy has expected arity', function t() {
	assert.strictEqual( zlaqsy.length, 10, 'has expected arity' );
});

test( 'zlaqsy throws TypeError for an invalid order', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsy( 'foo', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsy throws TypeError for an invalid uplo', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsy( 'column-major', 'invalid', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqsy throws RangeError for negative N', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqsy( 'column-major', 'upper', -1, A, 2, s, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqsy returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsy( 'column-major', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqsy writes \'yes\' to equed when scaling is applied', function t() {
	const A = new Complex128Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsy( 'column-major', 'upper', 2, A, 2, s, 1, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
