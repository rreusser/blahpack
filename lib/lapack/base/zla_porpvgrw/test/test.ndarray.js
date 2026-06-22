/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_porpvgrw from './../lib/index.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}

// Build a Complex128Array from interleaved real/imag float pairs.
function cArr( pairs ) {
	var f = new Float64Array( pairs.length );
	var i;
	for ( i = 0; i < pairs.length; i++ ) {
		f[ i ] = pairs[ i ];
	}
	return new Complex128Array( f.buffer );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_porpvgrw, 'function', 'is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_porpvgrw.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		zla_porpvgrw.ndarray( 'invalid', 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'ndarray ncols=0 returns 1', function t() {
	var r = zla_porpvgrw.ndarray( 'upper', 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'ndarray ncols=0 returns 1 (lower)', function t() {
	var r = zla_porpvgrw.ndarray( 'lower', 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( r, 1.0 );
});

test( 'ndarray upper 2x2 trivial (rpvgrw=1)', function t() {
	// A = [[1,0],[*,1]] (upper triangle stored in [0,0] and [0,1] and [1,1]).
	// AF = same.
	var A = cArr( [ 1, 0, 0, 0, 0.5, 0, 1, 0 ] );
	var AF = cArr( [ 1, 0, 0, 0, 0.5, 0, 1, 0 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw.ndarray( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
	// WORK column 0 max for AF = max(|1|+0) = 1; column 1 max = max(|0.5|, |1|) = 1.
	approxEqual( WORK[ 0 ], 1.0, 1e-12, 'WORK[0]' );
	approxEqual( WORK[ 1 ], 1.0, 1e-12, 'WORK[1]' );
	// A column maxes (n+i) at WORK[2..3]
	approxEqual( WORK[ 2 ], 1.0, 1e-12, 'WORK[2]' );
	approxEqual( WORK[ 3 ], 1.0, 1e-12, 'WORK[3]' );
});

test( 'ndarray lower 2x2 trivial (rpvgrw=1)', function t() {
	var A = cArr( [ 1, 0, 0.5, 0, 0, 0, 1, 0 ] );
	var AF = cArr( [ 1, 0, 0.5, 0, 0, 0, 1, 0 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw.ndarray( 'lower', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});

test( 'ndarray upper rpvgrw < 1 (factor grows)', function t() {
	// A column 0 max = 1, AF column 0 max = 2 → 0.5
	var A = cArr( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var AF = cArr( [ 2, 0, 0, 0, 0, 0, 1, 0 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw.ndarray( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'ndarray lower rpvgrw < 1 (factor grows)', function t() {
	var A = cArr( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	var AF = cArr( [ 2, 0, 0, 0, 0, 0, 1, 0 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw.ndarray( 'lower', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'ndarray complex magnitudes use CABS1', function t() {
	// A[0,0] = 1+1i → CABS1=2; AF[0,0] = 1+1i → CABS1=2
	var A = cArr( [ 1, 1 ] );
	var AF = cArr( [ 1, 1 ] );
	var WORK = new Float64Array( 2 );
	var r = zla_porpvgrw.ndarray( 'upper', 1, A, 1, 1, 0, AF, 1, 1, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
	approxEqual( WORK[ 0 ], 2.0, 1e-12, 'WORK[0]' );
	approxEqual( WORK[ 1 ], 2.0, 1e-12, 'WORK[1]' );
});

test( 'ndarray umax=0 column is skipped', function t() {
	// A column 0 has zero, AF column 0 has zero → no division. Other columns determine result.
	var A = cArr( [ 0, 0, 0, 0, 0, 0, 1, 0 ] );
	var AF = cArr( [ 0, 0, 0, 0, 0, 0, 2, 0 ] );
	var WORK = new Float64Array( 4 );
	var r = zla_porpvgrw.ndarray( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, WORK, 1, 0 );
	// Column 0 skipped (umax=0). Column 1: amax=1, umax=2 → 0.5.
	approxEqual( r, 0.5, 1e-12, 'r' );
});

test( 'ndarray lower 3x3 with strides', function t() {
	// Verify stride and offset handling.
	var N = 3;
	// Identity: A=AF=I. Each column max of A and AF = 1.
	var Aflat = new Float64Array( 2 * N * N );
	var AFflat = new Float64Array( 2 * N * N );
	Aflat[ 0 ] = 1; Aflat[ 8 ] = 1; Aflat[ 16 ] = 1;
	AFflat[ 0 ] = 1; AFflat[ 8 ] = 1; AFflat[ 16 ] = 1;
	var A = new Complex128Array( Aflat.buffer );
	var AF = new Complex128Array( AFflat.buffer );
	var WORK = new Float64Array( 2 * N );
	var r = zla_porpvgrw.ndarray( 'lower', N, A, 1, N, 0, AF, 1, N, 0, WORK, 1, 0 );
	approxEqual( r, 1.0, 1e-12, 'r' );
});
