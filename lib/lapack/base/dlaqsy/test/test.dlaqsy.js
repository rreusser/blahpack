/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsy from './../lib/dlaqsy.js';


// TESTS //

test( 'dlaqsy is a function', function t() {
	assert.strictEqual( typeof dlaqsy, 'function', 'is a function' );
});

test( 'dlaqsy has expected arity', function t() {
	assert.strictEqual( dlaqsy.length, 10, 'has expected arity' );
});

test( 'dlaqsy throws TypeError for an invalid order', function t() {
	const A = new Float64Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsy( 'foo', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsy throws TypeError for an invalid uplo', function t() {
	const A = new Float64Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsy( 'column-major', 'invalid', 2, A, 2, s, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsy throws RangeError for negative N', function t() {
	const A = new Float64Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsy( 'column-major', 'upper', -1, A, 2, s, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqsy returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const A = new Float64Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsy( 'column-major', 'upper', 2, A, 2, s, 1, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'dlaqsy writes \'yes\' to equed when scaling is applied', function t() {
	const A = new Float64Array( 4 );
	const s = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsy( 'column-major', 'upper', 2, A, 2, s, 1, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});
