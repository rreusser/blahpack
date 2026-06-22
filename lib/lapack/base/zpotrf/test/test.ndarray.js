// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';
import zpotrf2 from './../../zpotrf2/lib/base.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a random N-by-N Hermitian positive definite complex matrix (col-major, interleaved).
* A = B^H * B + N*I where B has deterministic pseudo-random entries.
*/
function randomHPD( N ) {
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var br;
	var bi;
	var cr;
	var ci;
	var ar;
	var ai;
	var i;
	var j;
	var k;
	var idx;

	// Build B with deterministic values
	var B = new Float64Array( N * N * 2 ); // interleaved
	for ( i = 0; i < N * N; i++ ) {
		B[ i * 2 ] = ( ( i * 7 + 3 ) % 13 ) - 6;     // real
		B[ i * 2 + 1 ] = ( ( i * 11 + 5 ) % 9 ) - 4;  // imag
	}

	// A = B^H * B (col-major)
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			cr = 0.0;
			ci = 0.0;
			for ( k = 0; k < N; k++ ) {
				// conj(B[k,i]) * B[k,j]
				// B[k,i] = B[(i*N+k)*2], B[(i*N+k)*2+1]
				br = B[ ( i * N + k ) * 2 ];
				bi = -B[ ( i * N + k ) * 2 + 1 ]; // conjugate
				ar = B[ ( j * N + k ) * 2 ];
				ai = B[ ( j * N + k ) * 2 + 1 ];
				cr += br * ar - bi * ai;
				ci += br * ai + bi * ar;
			}
			idx = ( j * N + i ) * 2;
			Av[ idx ] = cr;
			Av[ idx + 1 ] = ci;
		}
	}

	// Add N*I for strong positive definiteness
	for ( i = 0; i < N; i++ ) {
		idx = ( i * N + i ) * 2;
		Av[ idx ] += N;
		Av[ idx + 1 ] = 0.0; // ensure real diagonal
	}
	return A;
}

// TESTS //

test( 'zpotrf: lower_3x3', function t() {
	var tc = lower_3x3;
	var A = new Complex128Array( [
		10, 0, 3, 1, 1, -2,
		3, -1, 8, 0, 2, 1,
		1, 2, 2, -1, 6, 0
	] );
	var info = zpotrf( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf: upper_3x3', function t() {
	var tc = upper_3x3;
	var A = new Complex128Array( [
		10, 0, 3, 1, 1, -2,
		3, -1, 8, 0, 2, 1,
		1, 2, 2, -1, 6, 0
	] );
	var info = zpotrf( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf: lower_4x4', function t() {
	var tc = lower_4x4;
	var A = new Complex128Array( [
		14, 0, 4, 2, 2, -1, 1, 3,
		4, -2, 12, 0, 3, 1, 2, -2,
		2, 1, 3, -1, 10, 0, 1, 1,
		1, -3, 2, 2, 1, -1, 9, 0
	] );
	var info = zpotrf( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf: upper_4x4', function t() {
	var tc = upper_4x4;
	var A = new Complex128Array( [
		14, 0, 4, 2, 2, -1, 1, 3,
		4, -2, 12, 0, 3, 1, 2, -2,
		2, 1, 3, -1, 10, 0, 1, 1,
		1, -3, 2, 2, 1, -1, 9, 0
	] );
	var info = zpotrf( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf: not_posdef', function t() {
	var tc = not_posdef;
	var A = new Complex128Array( [
		1, 0, 2, 1, 3, 0,
		2, -1, 1, 0, 4, 0,
		3, 0, 4, 0, 1, 0
	] );
	var info = zpotrf( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotrf: n_zero', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var info = zpotrf( 'lower', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotrf: large lower (blocked path) matches zpotrf2', function t() {
	// N=80 > NB=64, forces the blocked code path
	var N = 80;
	var A1 = randomHPD( N );
	var A2 = new Complex128Array( A1 );
	var info1 = zpotrf( 'lower', N, A1, 1, N, 0 );
	var info2 = zpotrf2( 'lower', N, A2, 1, N, 0 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assertArrayClose( Array.from( reinterpret( A1, 0 ) ), Array.from( reinterpret( A2, 0 ) ), 1e-10, 'large lower blocked vs unblocked' );
});

test( 'zpotrf: large upper (blocked path) matches zpotrf2', function t() {
	var N = 80;
	var A1 = randomHPD( N );
	var A2 = new Complex128Array( A1 );
	var info1 = zpotrf( 'upper', N, A1, 1, N, 0 );
	var info2 = zpotrf2( 'upper', N, A2, 1, N, 0 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assertArrayClose( Array.from( reinterpret( A1, 0 ) ), Array.from( reinterpret( A2, 0 ) ), 1e-10, 'large upper blocked vs unblocked' );
});

test( 'zpotrf: large not-posdef (blocked path)', function t() {
	var N = 80;
	var A = randomHPD( N );
	var Av = reinterpret( A, 0 );
	// Make the last diagonal negative
	var idx = ( ( N - 1 ) * N + ( N - 1 ) ) * 2;
	Av[ idx ] = -1000.0;
	var info = zpotrf( 'lower', N, A, 1, N, 0 );
	assert.ok( info > 0 );
});

test( 'zpotrf: large not-posdef upper (blocked path)', function t() {
	var N = 80;
	var A = randomHPD( N );
	var Av = reinterpret( A, 0 );
	var idx = ( ( N - 1 ) * N + ( N - 1 ) ) * 2;
	Av[ idx ] = -1000.0;
	var info = zpotrf( 'upper', N, A, 1, N, 0 );
	assert.ok( info > 0 );
});

// ndarray validation tests

test( 'zpotrf: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function() {
		ndarray( 'invalid', 3, new Complex128Array( 9 ), 1, 3, 0 );
	}, TypeError );
});

test( 'zpotrf: ndarray throws RangeError for negative N', function t() {
	assert.throws( function() {
		ndarray( 'upper', -1, new Complex128Array( 9 ), 1, 3, 0 );
	}, RangeError );
});
