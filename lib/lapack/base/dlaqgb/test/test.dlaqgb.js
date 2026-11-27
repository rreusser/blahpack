/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqgb from './../lib/dlaqgb.js';


// TESTS //

test( 'dlaqgb is a function', function t() {
	assert.strictEqual( typeof dlaqgb, 'function', 'is a function' );
});

test( 'dlaqgb has expected arity', function t() {
	assert.strictEqual( dlaqgb.length, 15, 'has expected arity' );
});

test( 'dlaqgb throws TypeError for an invalid order', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqgb( 'foo', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqgb throws RangeError for negative M', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqgb( 'column-major', -1, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqgb throws RangeError for negative N', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqgb( 'column-major', 2, -1, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqgb returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'dlaqgb writes \'row\' to equed when scaling is applied', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 0.01, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'row', 'equed' );
});

test( 'dlaqgb writes \'column\' to equed when scaling is applied', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 1, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'column', 'equed' );
});

test( 'dlaqgb writes \'both\' to equed when scaling is applied', function t() {
	const AB = new Float64Array( 6 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqgb( 'column-major', 2, 2, 1, 1, AB, 3, r, 1, c, 1, 0.01, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'both', 'equed' );
});
