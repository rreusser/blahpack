/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqge from './../lib/zlaqge.js';


// TESTS //

test( 'zlaqge is a function', function t() {
	assert.strictEqual( typeof zlaqge, 'function', 'is a function' );
});

test( 'zlaqge has expected arity', function t() {
	assert.strictEqual( zlaqge.length, 13, 'has expected arity' );
});

test( 'zlaqge throws TypeError for an invalid order', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqge( 'foo', 2, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqge throws RangeError for negative M', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqge( 'column-major', -1, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqge throws RangeError for negative N', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqge( 'column-major', 2, -1, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqge returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqge writes \'row\' to equed when scaling is applied', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 0.01, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'row', 'equed' );
});

test( 'zlaqge writes \'column\' to equed when scaling is applied', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 1, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'column', 'equed' );
});

test( 'zlaqge writes \'both\' to equed when scaling is applied', function t() {
	const A = new Complex128Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 0.01, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'both', 'equed' );
});
