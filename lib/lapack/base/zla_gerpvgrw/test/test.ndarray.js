/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gerpvgrw from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'zla_gerpvgrw: main export is a function', function t() {
	assert.strictEqual( typeof zla_gerpvgrw, 'function', 'is a function' );
});

test( 'zla_gerpvgrw: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zla_gerpvgrw( -1, 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0 );
	}, RangeError );
});

test( 'zla_gerpvgrw: N=0 returns 1', function t() {
	var r = zla_gerpvgrw( 0, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gerpvgrw: ncols=0 returns 1', function t() {
	var A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	var AF = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0 ] );
	var r = zla_gerpvgrw( 2, 0, A, 1, 2, 0, AF, 1, 2, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gerpvgrw: 1x1 unit ratio (real)', function t() {
	// CABS1(3+0i)=3 in both -> ratio 1
	var A = new Complex128Array( [ 3, 0 ] );
	var AF = new Complex128Array( [ 3, 0 ] );
	var r = zla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: 1x1 with growth', function t() {
	// CABS1(1)=1, CABS1(2)=2 -> 0.5
	var A = new Complex128Array( [ 1, 0 ] );
	var AF = new Complex128Array( [ 2, 0 ] );
	var r = zla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: 1x1 zero U column', function t() {
	var A = new Complex128Array( [ 5, 0 ] );
	var AF = new Complex128Array( [ 0, 0 ] );
	var r = zla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'zla_gerpvgrw: purely imaginary 1x1', function t() {
	// CABS1(0+3i)=3, CABS1(0+6i)=6 -> 0.5
	var A = new Complex128Array( [ 0, 3 ] );
	var AF = new Complex128Array( [ 0, 6 ] );
	var r = zla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: complex with re+im (CABS1 = |re|+|im|)', function t() {
	// CABS1(3+4i) = 7, CABS1(1+1i)=2 -> ratio 7/2 capped at 1
	// Use one column where AF dominates: A=(1+1i)=2, AF=(3+4i)=7 -> 2/7
	var A = new Complex128Array( [ 1, 1 ] );
	var AF = new Complex128Array( [ 3, 4 ] );
	var r = zla_gerpvgrw( 1, 1, A, 1, 1, 0, AF, 1, 1, 0 );
	approxEqual( r, 2.0 / 7.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: 3x3 column-major, all upper-triangular', function t() {
	var N = 3;
	// Column-major upper-triangular matrices stored as 9 complex entries (18 floats)
	// A col 0 = (2+0i, 0, 0); col 1 = (1+0i, 3+0i, 0); col 2 = (0, 1+0i, 4+0i)
	var A = new Complex128Array( [
		2, 0,  0, 0,  0, 0,
		1, 0,  3, 0,  0, 0,
		0, 0,  1, 0,  4, 0
	]);
	var AF = new Complex128Array( [
		2, 0,  0, 0,  0, 0,
		1, 0,  3, 0,  0, 0,
		0, 0,  1, 0,  4, 0
	]);
	var r = zla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: 3x3 with growth in column 1', function t() {
	var N = 3;
	// Column 1 of A: max CABS1 = 5 (5+0i in row 0). Column 1 of AF upper (rows 0..1): max CABS1 = 20.
	var A = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		5, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	]);
	var AF = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		20, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	]);
	var r = zla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 0.25, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: ncols < N (subset of columns)', function t() {
	var N = 3;
	var A = new Complex128Array( [
		2, 0,  0, 0,  0, 0,
		1, 0,  3, 0,  0, 0,
		0, 0,  0, 0,  9, 0
	]);
	var AF = new Complex128Array( [
		2, 0,  0, 0,  0, 0,
		1, 0,  3, 0,  0, 0,
		0, 0,  0, 0,  9, 0
	]);
	// Process only first 2 columns; column 2's data not consulted
	var r = zla_gerpvgrw( N, 2, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: large complex values', function t() {
	var N = 2;
	// A col 0: CABS1(1e10+0i)=1e10. AF col 0: CABS1(2e10+0i)=2e10 -> 0.5
	var A = new Complex128Array( [ 1e10, 0,  0, 0,  0, 0,  1, 0 ] );
	var AF = new Complex128Array( [ 2e10, 0,  0, 0,  0, 0,  1, 0 ] );
	var r = zla_gerpvgrw( N, 2, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 0.5, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: zero U column in middle does not corrupt rpvgrw', function t() {
	var N = 3;
	var A = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		4, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	]);
	var AF = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		0, 0,  0, 0,  0, 0,  // upper-triangle of col 1 is zero
		0, 0,  0, 0,  1, 0
	]);
	var r = zla_gerpvgrw( N, N, A, 1, N, 0, AF, 1, N, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: respects nonzero offset', function t() {
	var N = 2;
	// 2 leading complex elements as padding before the matrix.
	var A = new Complex128Array( [ 99, 99,  88, 88,  1, 0,  0, 0,  0, 0,  1, 0 ] );
	var AF = new Complex128Array( [ 99, 99,  88, 88,  2, 0,  0, 0,  0, 0,  4, 0 ] );
	var r = zla_gerpvgrw( N, N, A, 1, N, 2, AF, 1, N, 2 );
	// col0: 1/2=0.5, col1: 1/4=0.25, min=0.25
	approxEqual( r, 0.25, 1e-12, 'rpvgrw' );
});

test( 'zla_gerpvgrw: respects strides (LDA padding)', function t() {
	var N = 2;
	// LDA=3 so col 1 starts at index 3 (not 2)
	var A = new Complex128Array( [ 1, 0,  0, 0,  0, 0,  0, 0,  1, 0,  0, 0 ] );
	var AF = new Complex128Array( [ 1, 0,  0, 0,  0, 0,  0, 0,  1, 0,  0, 0 ] );
	var r = zla_gerpvgrw( N, N, A, 1, 3, 0, AF, 1, 3, 0 );
	approxEqual( r, 1.0, 1e-12, 'rpvgrw' );
});
