/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstev from './../lib/ndarray.js';

// FIXTURES //

import eigenvalues_only_5x5 from './fixtures/eigenvalues_only_5x5.json' with { type: 'json' };
import eigenvectors_5x5 from './fixtures/eigenvectors_5x5.json' with { type: 'json' };
import eigenvectors_4x4 from './fixtures/eigenvectors_4x4.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import already_sorted from './fixtures/already_sorted.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dstev: eigenvalues_only_5x5 (JOBZ=N)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = eigenvalues_only_5x5;
	N = 5;
	d = new Float64Array( [ 2, 2, 2, 2, 2 ] );
	e = new Float64Array( [ -1, -1, -1, -1 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dstev( 'no-vectors', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dstev: eigenvectors_5x5 (JOBZ=V)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;
	var i;

	tc = eigenvectors_5x5;
	N = 5;
	d = new Float64Array( [ 2, 2, 2, 2, 2 ] );
	e = new Float64Array( [ -1, -1, -1, -1 ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N - 2 );
	info = dstev( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	for ( i = 0; i < N; i++ ) {
		assertEigenvectorClose( Z, N, i, tc.z, 1e-13, 'z col ' + i );
	}
});

test( 'dstev: eigenvectors_4x4 (JOBZ=V)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;
	var i;

	tc = eigenvectors_4x4;
	N = 4;
	d = new Float64Array( [ 4, 1, 3, 2 ] );
	e = new Float64Array( [ 1, 0.5, 1.5 ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N - 2 );
	info = dstev( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-13, 'd' );
	for ( i = 0; i < N; i++ ) {
		assertEigenvectorClose( Z, N, i, tc.z, 1e-13, 'z col ' + i );
	}
});

test( 'dstev: n_zero', function t() {
	var WORK;
	var info;
	var tc;
	var d;
	var e;
	var Z;

	tc = n_zero;
	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dstev( 'no-vectors', 0, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dstev: n_one (JOBZ=V)', function t() {
	var WORK;
	var info;
	var tc;
	var d;
	var e;
	var Z;

	tc = n_one;
	d = new Float64Array( [ 7.5 ] );
	e = new Float64Array( 0 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dstev( 'compute-vectors', 1, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
	assertArrayClose( toArray( Z ), tc.z, 1e-14, 'z' );
});

test( 'dstev: already_sorted (JOBZ=N, diagonal matrix)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var d;
	var e;
	var Z;

	tc = already_sorted;
	N = 4;
	d = new Float64Array( [ 1, 2, 3, 4 ] );
	e = new Float64Array( [ 0, 0, 0 ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dstev( 'no-vectors', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( d ), tc.d, 1e-14, 'd' );
});

test( 'dstev: very small values trigger scaling path (tnrm < RMIN)', function t() { // eslint-disable-line max-len
	var scale;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 4;
	scale = 1e-148;
	d = new Float64Array( [ 4 * scale, 1 * scale, 3 * scale, 2 * scale ] );
	e = new Float64Array( [ 1 * scale, 0.5 * scale, 1.5 * scale ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N - 2 );
	info = dstev( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( var i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ] + 1e-300, 'eigenvalues sorted: d[' + i + ']=' + d[i] + ' <= d[' + (i+1) + ']=' + d[i+1] ); // eslint-disable-line max-len
	}
});

test( 'dstev: very large values trigger scaling path (tnrm > RMAX)', function t() { // eslint-disable-line max-len
	var scale;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 4;
	scale = 1e147;
	d = new Float64Array( [ 4 * scale, 1 * scale, 3 * scale, 2 * scale ] );
	e = new Float64Array( [ 1 * scale, 0.5 * scale, 1.5 * scale ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N - 2 );
	info = dstev( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( var i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ] * ( 1 + 1e-10 ), 'eigenvalues sorted: d[' + i + ']=' + d[i] + ' <= d[' + (i+1) + ']=' + d[i+1] ); // eslint-disable-line max-len
	}
});

test( 'dstev: JOBZ=V with larger 8x8 matrix', function t() {
	var WORK;
	var info;
	var dot;
	var N;
	var d;
	var e;
	var Z;
	var i;
	var j;
	var k;

	N = 8;
	d = new Float64Array( [ 10, 5, 8, 3, 7, 2, 6, 1 ] );
	e = new Float64Array( [ 1, 1, 1, 1, 1, 1, 1 ] );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 2 * N - 2 );
	info = dstev( 'compute-vectors', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ] + 1e-10, 'eigenvalues sorted' );
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = i; j < N; j++ ) {
			dot = 0.0;
			for ( k = 0; k < N; k++ ) {
				dot += Z[ i * N + k ] * Z[ j * N + k ];
			}
			if ( i === j ) {
				assertClose( dot, 1.0, 1e-12, 'Z^T*Z diagonal(' + i + ')' );
			} else {
				assertClose( dot, 0.0, 1e-12, 'Z^T*Z off-diagonal(' + i + ',' + j + ')' );
			}
		}
	}
});

test( 'dstev: eigenvalues only with scaling (JOBZ=N, small values)', function t() { // eslint-disable-line max-len
	var scale;
	var WORK;
	var info;
	var N;
	var d;
	var e;
	var Z;

	N = 5;
	scale = 1e-148;
	d = new Float64Array( [ 2 * scale, 2 * scale, 2 * scale, 2 * scale, 2 * scale ] ); // eslint-disable-line max-len
	e = new Float64Array( [ -1 * scale, -1 * scale, -1 * scale, -1 * scale ] );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dstev( 'no-vectors', N, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	for ( var i = 0; i < N - 1; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ] + 1e-300, 'eigenvalues sorted' );
	}
});

// FUNCTIONS //

/**
* Assert an eigenvector column matches the expected (up to sign flip).
*
* @param {Float64Array} Z - computed eigenvector matrix (column-major, N x N)
* @param {integer} N - dimension
* @param {integer} col - column index (0-based)
* @param {Array} expected - expected flat column-major eigenvector data
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertEigenvectorClose( Z, N, col, expected, tol, msg ) {
	var sign;
	var j;
	var e;
	var a;

	// Determine sign by checking first non-negligible element
	sign = 1;
	for ( j = 0; j < N; j++ ) {
		a = Z[ col * N + j ];
		e = expected[ col * N + j ];
		if ( Math.abs( e ) > 1e-10 ) {
			if ( ( a > 0 ) !== ( e > 0 ) ) {
				sign = -1;
			}
			break;
		}
	}

	for ( j = 0; j < N; j++ ) {
		a = sign * Z[ col * N + j ];
		e = expected[ col * N + j ];
		assertClose( a, e, tol, msg + '[' + j + ']' );
	}
}
