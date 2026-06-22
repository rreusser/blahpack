/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_porpvgrw from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}


// TESTS //

test( 'dla_porpvgrw: main export is a function', function t() {
	assert.strictEqual( typeof dla_porpvgrw, 'function', 'is a function' );
});

test( 'dla_porpvgrw: throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		dla_porpvgrw( 'invalid', 1, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dla_porpvgrw: ncols=0 returns 1 (upper)', function t() {
	var r = dla_porpvgrw( 'upper', 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_porpvgrw: ncols=0 returns 1 (lower)', function t() {
	var r = dla_porpvgrw( 'lower', 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'dla_porpvgrw: upper 1x1 trivial', function t() {
	// Rpvgrw is min( amax/umax, 1 ) so for amax > umax it is capped at 1.
	var WORK = new Float64Array( 2 );
	var AF = new Float64Array( [ 2.0 ] );
	var A = new Float64Array( [ 4.0 ] );
	var r = dla_porpvgrw( 'upper', 1, A, 1, 1, 0, AF, 1, 1, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
	approxEqual( WORK[ 0 ], 2.0, 1e-12, 'WORK[0] AF column max' );
	approxEqual( WORK[ 1 ], 4.0, 1e-12, 'WORK[1] A column max' );
});

test( 'dla_porpvgrw: lower 1x1 trivial', function t() {
	var WORK = new Float64Array( 2 );
	var AF = new Float64Array( [ 2.0 ] );
	var A = new Float64Array( [ 4.0 ] );
	var r = dla_porpvgrw( 'lower', 1, A, 1, 1, 0, AF, 1, 1, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper 2x2 trivial (rpvgrw=1)', function t() {
	// Column-major 2x2: A and AF identical, simple values.
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 1.0, 0.0, 0.5, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.0, 0.5, 1.0 ] );
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
	approxEqual( WORK[ 0 ], 1.0, 1e-12, 'WORK[0]' );
	approxEqual( WORK[ 1 ], 1.0, 1e-12, 'WORK[1]' );
	approxEqual( WORK[ 2 ], 1.0, 1e-12, 'WORK[2]' );
	approxEqual( WORK[ 3 ], 1.0, 1e-12, 'WORK[3]' );
});

test( 'dla_porpvgrw: lower 2x2 trivial (rpvgrw=1)', function t() {
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 1.0, 0.5, 0.0, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.5, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'lower', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper rpvgrw < 1 (factor grows)', function t() {
	// A column 0 max = 1, AF column 0 max = 2 → ratio 0.5
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 2.0, 0.0, 0.0, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'dla_porpvgrw: lower rpvgrw < 1 (factor grows)', function t() {
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 2.0, 0.0, 0.0, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'lower', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper umax=0 column is skipped', function t() {
	// Column 0 has all zero in AF → skipped (umax=0, no division).
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 0.0, 0.0, 0.0, 2.0 ] );
	var A = new Float64Array( [ 0.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );

	// Column 0 skipped. Column 1: amax=1, umax=2 → 0.5.
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'dla_porpvgrw: lower umax=0 column is skipped', function t() {
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 0.0, 0.0, 0.0, 2.0 ] );
	var A = new Float64Array( [ 0.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'lower', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper 3x3 well-conditioned (identity)', function t() {
	// Identity A and AF: rpvgrw = 1.
	var WORK = new Float64Array( 6 );
	var AF = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: lower 3x3 well-conditioned (identity)', function t() {
	var WORK = new Float64Array( 6 );
	var AF = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'lower', 3, A, 1, 3, 0, AF, 1, 3, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper 3x3 ill-conditioned (rpvgrw small)', function t() {
	// AF column 1 has growth: max in A column 1 = 1, AF column 1 = 100.
	// Other columns: rpvgrw 1.
	var WORK = new Float64Array( 6 );
	var AF = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		100.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	var A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	var r = dla_porpvgrw( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, WORK, 1, 0 );

	// Column 1: amax=1, umax=100 → 0.01.
	approxEqual( r, 0.01, 1e-12, 'r' );
});

test( 'dla_porpvgrw: lower 3x3 ill-conditioned', function t() {
	var WORK = new Float64Array( 6 );
	var AF = new Float64Array([
		1.0,
		0.5,
		0.0,
		0.0,
		50.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	var A = new Float64Array([
		1.0,
		0.5,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		1.0
	]);
	var r = dla_porpvgrw( 'lower', 3, A, 1, 3, 0, AF, 1, 3, 0, WORK, 1, 0 );

	// Column 1: amax=1, umax=50 → 0.02.
	approxEqual( r, 0.02, 1e-12, 'r' );
});

test( 'dla_porpvgrw: upper with stride and offset', function t() {
	// Verify offset shifts where reading begins.
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ 88.0, 88.0, 1.0, 0.5, 0.0, 1.0 ] );
	var A = new Float64Array( [ 99.0, 99.0, 1.0, 0.5, 0.0, 1.0 ] );
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 2, AF, 1, 2, 2, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: WORK with non-unit stride', function t() {
	// Use stride 2 on WORK; ensure intermediate slots aren't touched.
	var WORK;
	var AF;
	var A;
	var r;
	var i;

	WORK = new Float64Array( 8 );
	AF = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	for ( i = 0; i < 8; i++ ) {
		WORK[ i ] = -1.0;
	}
	r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 2, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );

	// Stride-2 slots: indexes 0, 2, 4, 6 should be set to 1.
	approxEqual( WORK[ 0 ], 1.0, 1e-12, 'WORK[0]' );
	approxEqual( WORK[ 2 ], 1.0, 1e-12, 'WORK[2]' );
	approxEqual( WORK[ 4 ], 1.0, 1e-12, 'WORK[4]' );
	approxEqual( WORK[ 6 ], 1.0, 1e-12, 'WORK[6]' );

	// Untouched slots remain -1.
	assert.strictEqual( WORK[ 1 ], -1.0 );
	assert.strictEqual( WORK[ 3 ], -1.0 );
});

test( 'dla_porpvgrw: upper 4x4 sample', function t() {
	// 4x4 SPD matrix with Cholesky factor.
	// A = [[10, 1, 1, 1], [1, 10, 1, 1], [1, 1, 10, 1], [1, 1, 1, 10]]
	// Use upper triangle (column-major): col0[0], col1[0..1], col2[0..2], col3[0..3]
	var WORK = new Float64Array( 8 );
	var AF = new Float64Array([
		10.0,
		0.0,
		0.0,
		0.0,
		1.0,
		10.0,
		0.0,
		0.0,
		1.0,
		1.0,
		10.0,
		0.0,
		1.0,
		1.0,
		1.0,
		10.0
	]);
	var A = new Float64Array([
		10.0,
		0.0,
		0.0,
		0.0,
		1.0,
		10.0,
		0.0,
		0.0,
		1.0,
		1.0,
		10.0,
		0.0,
		1.0,
		1.0,
		1.0,
		10.0
	]);
	var r = dla_porpvgrw( 'upper', 4, A, 1, 4, 0, AF, 1, 4, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: lower 4x4 sample', function t() {
	var WORK = new Float64Array( 8 );
	var AF = new Float64Array([
		10.0,
		1.0,
		1.0,
		1.0,
		0.0,
		10.0,
		1.0,
		1.0,
		0.0,
		0.0,
		10.0,
		1.0,
		0.0,
		0.0,
		0.0,
		10.0
	]);
	var A = new Float64Array([
		10.0,
		1.0,
		1.0,
		1.0,
		0.0,
		10.0,
		1.0,
		1.0,
		0.0,
		0.0,
		10.0,
		1.0,
		0.0,
		0.0,
		0.0,
		10.0
	]);
	var r = dla_porpvgrw( 'lower', 4, A, 1, 4, 0, AF, 1, 4, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'dla_porpvgrw: takes minimum across columns', function t() {
	// Different ratios per column: rpvgrw is the minimum.
	// Col 0: amax=1, umax=2 → 0.5.
	// Col 1: amax=2, umax=8 → 0.25.
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array([
		2.0,
		0.0,
		2.0,
		8.0
	]);
	var A = new Float64Array([
		1.0,
		0.0,
		2.0,
		2.0
	]);
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.25, 1e-12, 'r' );
});

test( 'dla_porpvgrw: negative entries use absolute value', function t() {
	var WORK = new Float64Array( 4 );
	var AF = new Float64Array( [ -3.0, 0.0, 0.0, -4.0 ] );
	var A = new Float64Array( [ -3.0, 0.0, 0.0, -4.0 ] );
	var r = dla_porpvgrw( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
	approxEqual( WORK[ 0 ], 3.0, 1e-12, 'WORK[0]' );
	approxEqual( WORK[ 1 ], 4.0, 1e-12, 'WORK[1]' );
});
