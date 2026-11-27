/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqge from './../lib/dlaqge.js';


// TESTS //

test( 'dlaqge is a function', function t() {
	assert.strictEqual( typeof dlaqge, 'function', 'is a function' );
});

test( 'dlaqge has expected arity', function t() {
	assert.strictEqual( dlaqge.length, 13, 'has expected arity' );
});

test( 'dlaqge throws TypeError for an invalid order', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqge( 'foo', 2, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqge throws RangeError for negative M', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqge( 'column-major', -1, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqge throws RangeError for negative N', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqge( 'column-major', 2, -1, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqge returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 1, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'dlaqge writes \'row\' to equed when scaling is applied', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 0.01, 1, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'row', 'equed' );
});

test( 'dlaqge writes \'column\' to equed when scaling is applied', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 1, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'column', 'equed' );
});

test( 'dlaqge writes \'both\' to equed when scaling is applied', function t() {
	const A = new Float64Array( 4 );
	const r = new Float64Array( [ 0.5, 2.0 ] );
	const c = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqge( 'column-major', 2, 2, A, 2, r, 1, c, 1, 0.01, 0.01, 1, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'both', 'equed' );
});
