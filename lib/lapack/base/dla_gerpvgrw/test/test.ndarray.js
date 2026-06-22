/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gerpvgrw from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'dla_gerpvgrw: main export is a function', function t() {
	assert.strictEqual( typeof dla_gerpvgrw, 'function', 'is a function' );
});

test( 'dla_gerpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		dla_gerpvgrw( -1, 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0 );
	}, RangeError );
});

test( 'dla_gerpvgrw: N=0 returns 1', function t() {
	var A = new Float64Array( 0 );
	var AF = new Float64Array( 0 );
	var r = dla_gerpvgrw( 0, 0, A, 1, 1, 0, AF, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gerpvgrw: ncols=0 returns 1', function t() {
	var A = new Float64Array( [ 1, 2, 3, 4 ] );
	var AF = new Float64Array( [ 1, 2, 3, 4 ] );
	var r = dla_gerpvgrw( 2, 0, A, 1, 2, 0, AF, 1, 2, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gerpvgrw: 1x1 unit ratio', function t() {
	// A = [3], AF (U) = [3] -> amax=3, umax=3, ratio=1
	var A = new Float64Array( [ 3 ] );
	var AF = new Float64Array( [ 3 ] );
	var r = dla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: 1x1 with growth (amax<umax)', function t() {
	// A = [1], AF = [2] -> amax=1, umax=2, ratio=0.5
	var A = new Float64Array( [ 1 ] );
	var AF = new Float64Array( [ 2 ] );
	var r = dla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: 1x1 zero U column does not modify rpvgrw', function t() {
	// umax=0 branch - rpvgrw stays 1
	var A = new Float64Array( [ 5 ] );
	var AF = new Float64Array( [ 0 ] );
	var r = dla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_gerpvgrw: 3x3 column-major basic case', function t() {
	// A and AF identical -> ratio 1 per column.
	var N = 3;
	var A = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] ); // upper triangular, col-major
	var AF = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] );
	var r = dla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: 3x3 with growth in column 1', function t() {
	// Engineer column-1 (j=1) growth: AF[0,1]=20, but only 5 in A col 1 -> ratio 0.25
	var N = 3;
	var A = new Float64Array( [ 1, 0, 0, 5, 1, 0, 0, 0, 1 ] );
	var AF = new Float64Array( [ 1, 0, 0, 20, 1, 0, 0, 0, 1 ] );
	var r = dla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 0.25, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: ncols < N (process subset of columns)', function t() {
	// 4x4 matrix, only first 2 cols processed.
	var N = 4;
	var A = new Float64Array( [
		1, 0, 0, 0,
		2, 1, 0, 0,
		9, 9, 1, 0,
		9, 9, 9, 1
	]);
	var AF = new Float64Array( [
		1, 0, 0, 0,
		2, 1, 0, 0,
		9, 9, 1, 0,
		9, 9, 9, 1
	]);
	var r = dla_gerpvgrw( N, 2, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: large values -> ratio 0.5', function t() {
	// 2x2: A col0=[1e10, 0], AF col0=[2e10, 0] -> ratio 0.5
	var N = 2;
	var A = new Float64Array( [ 1e10, 0, 0, 1 ] );
	var AF = new Float64Array( [ 2e10, 0, 0, 1 ] );
	var r = dla_gerpvgrw( N, 2, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: zero U column in middle does not corrupt rpvgrw', function t() {
	var N = 3;
	var A = new Float64Array( [ 1, 0, 0, 4, 1, 0, 0, 0, 1 ] );
	// AF[*,1] entirely zero in upper triangle -> umax=0, branch skipped
	var AF = new Float64Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1 ] );
	var r = dla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: respects offsets and strides', function t() {
	// 2x2 with leading-dim padding: pretend LDA=4, only top 2 rows used.
	var N = 2;
	var A = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0 ] ); // col-major, LDA=4
	var AF = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0 ] );
	// strideA1=1, strideA2=4, offset=0
	var r = dla_gerpvgrw( N, N, A, 1, 4, 0, AF, 1, 4, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: respects nonzero offsets', function t() {
	var N = 2;
	// A starts at offset 2 in a longer buffer.
	var A = new Float64Array( [ 99, 99, 1, 0, 0, 1 ] );
	var AF = new Float64Array( [ 99, 99, 2, 0, 0, 4 ] );
	var r = dla_gerpvgrw( N, N, A, 1, N, 2, AF, 1, N, 2 );
	// col 0: amax=1, umax=2 -> 0.5; col 1: amax=1, umax=4 -> 0.25; min=0.25
	approxEqual( r, 0.25, 1e-12, 'rpvgrw' );
});

test( 'dla_gerpvgrw: signs do not matter (uses abs)', function t() {
	var N = 2;
	var A = new Float64Array( [ -3, 0, 0, -2 ] );
	var AF = new Float64Array( [ -3, 0, 0, -2 ] );
	var r = dla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});
