/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqgb from './../lib/zlaqgb.js';


// TESTS //

test( 'zlaqgb is a function', function t() {
	assert.strictEqual( typeof zlaqgb, 'function', 'is a function' );
});

test( 'zlaqgb has expected arity', function t() {
	assert.strictEqual( zlaqgb.length, 15, 'has expected arity' );
});

test( 'zlaqgb throws TypeError for an invalid order', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqgb( 'foo', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqgb throws RangeError for negative M', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqgb( 'column-major', -1, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqgb throws RangeError for negative N', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqgb( 'column-major', 2, -1, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqgb returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqgb writes \'row\' to equed when scaling is applied', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 0.01, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'row', 'equed' );
});

test( 'zlaqgb writes \'column\' to equed when scaling is applied', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'column', 'equed' );
});

test( 'zlaqgb writes \'both\' to equed when scaling is applied', function t() {
	const AB = new Complex128Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 0.01, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'both', 'equed' );
});
