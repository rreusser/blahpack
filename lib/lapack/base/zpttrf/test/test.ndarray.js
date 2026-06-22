// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpttrf from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5 from './fixtures/basic_5x5.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import not_posdef_first from './fixtures/not_posdef_first.json' with { type: 'json' };
import not_posdef_mid from './fixtures/not_posdef_mid.json' with { type: 'json' };
import unrolled_8x8 from './fixtures/unrolled_8x8.json' with { type: 'json' };
import n_two from './fixtures/n_two.json' with { type: 'json' };
import pure_imag from './fixtures/pure_imag.json' with { type: 'json' };

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

// TESTS //

test( 'zpttrf: basic_5x5', function t() {
	var info;
	var tc = basic_5x5;
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});

test( 'zpttrf: n_one', function t() {
	var info;
	var tc = n_one;
	var d = new Float64Array( [ 3.0 ] );
	var e = new Complex128Array( 0 );

	info = zpttrf( 1, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
});

test( 'zpttrf: n_zero', function t() {
	var info;
	var tc = n_zero;
	var d = new Float64Array( 0 );
	var e = new Complex128Array( 0 );

	info = zpttrf( 0, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'zpttrf: not_posdef_first', function t() {
	var info;
	var tc = not_posdef_first;
	var d = new Float64Array( [ -1.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 3, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});

test( 'zpttrf: not_posdef_mid', function t() {
	var info;
	var tc = not_posdef_mid;
	var d = new Float64Array( [ 1.0, 1.0, 4.0 ] );
	var e = new Complex128Array( [ 2.0, 0.0, 1.0, 0.0 ] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 3, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});

test( 'zpttrf: unrolled_8x8', function t() {
	var info;
	var tc = unrolled_8x8;
	var d = new Float64Array( [ 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0 ] );
	var e = new Complex128Array( [
		1.0, 0.5,
		0.5, 1.0,
		1.0, -0.5,
		-0.5, 1.0,
		1.0, 1.0,
		0.5, -0.5,
		-1.0, 0.5
	] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 8, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});

test( 'zpttrf: n_two', function t() {
	var info;
	var tc = n_two;
	var d = new Float64Array( [ 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 1.0 ] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 2, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});

// Coverage tests: exercise failure branches inside the 4-unrolled loop.
// For N=5, i4 = (5-1)%4 = 0, so the unrolled loop starts at i=0.

test( 'zpttrf: fail at position 1 in unrolled loop (d[0] <= 0, N=5)', function t() {
	var info;
	// d[0] = -1 => immediate failure at first element of unrolled block
	var d = new Float64Array( [ -1.0, 4.0, 4.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	assert.equal( info, 1 );
});

test( 'zpttrf: fail at position 2 in unrolled loop (d[1] <= 0 after update, N=5)', function t() {
	var info;
	// d[0] = 1, e[0] = (2+0i) => d[1] = 1 - 4/1 = -3 => fail at i+1 = 2
	var d = new Float64Array( [ 1.0, 1.0, 4.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 2.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	assert.equal( info, 2 );
});

test( 'zpttrf: fail at position 3 in unrolled loop (N=5)', function t() {
	var info;
	// For N=5, i4=0, unrolled loop starts at i=0.
	// Need d[2] <= 0 after processing steps 0 and 1.
	// Step 0: d[0]=4, e[0]=(0.01,0) => d[1] = 4 - 0.01^2/4 ≈ 4
	// Step 1: d[1]≈4, e[1]=(2,0) => d[2] = 1 - 4/4 = 0 => info = 3
	var d = new Float64Array( [ 4.0, 4.0, 1.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 0.01, 0.0, 2.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	assert.equal( info, 3 );
});

test( 'zpttrf: fail at position 4 in unrolled loop (N=5)', function t() {
	var info;
	// d = [4, 4, 4, 1, 4], e = [small, small, small, (2+0i)]
	// Positions 0,1,2 process fine with small e values.
	// After processing i=3: d[4] = 4 - (2^2+0^2)/1 = 4 - 4 = 0 => fail at i+4 = 4
	// But wait, i+4 is checked as d[id + (3*strideD)] at element i+3.
	// Actually for N=5, the loop runs i=0..3, so element i+3 = 3.
	// d[3] = 1, e[3] = (2+0i) => d[4] = 4 - 4/1 = 0 => d[4] <= 0
	// That's caught by the final d[N] check (line 138), not unrolled i+3 check.
	// For unrolled i+3 check (line 121), need d[id + (3*strideD)] <= 0 BEFORE computing e[i+3].
	// So d[3] must be <= 0 after the update from step i+2.
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 1.0, 4.0 ] );
	var e = new Complex128Array( [ 0.01, 0.0, 0.01, 0.0, 2.0, 0.0, 1.0, 0.0 ] );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	// After i=2: d[3] = 1 - (2^2)/4 ≈ 1 - 1 = 0 => info = 4
	assert.equal( info, 4 );
});

test( 'zpttrf: fail at final d[N] check (N=5)', function t() {
	var info;
	// All intermediate steps succeed, but d[N] <= 0 at the end.
	// d = [4, 4, 4, 4, 1], e = [small, small, small, (2+0i)]
	// After processing e[3]: d[4] = 1 - (2^2+0^2)/4 = 1 - 1 = 0 => info = N = 5
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 1.0 ] );
	var e = new Complex128Array( [ 0.01, 0.0, 0.01, 0.0, 0.01, 0.0, 2.0, 0.0 ] );

	info = zpttrf( 5, d, 1, 0, e, 1, 0 );

	assert.equal( info, 5 );
});

test( 'zpttrf: pure_imag', function t() {
	var info;
	var tc = pure_imag;
	var d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 0.0, 1.0, 0.0, 1.0 ] );
	var ev = reinterpret( e, 0 );

	info = zpttrf( 3, d, 1, 0, e, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( ev, tc.e, 1e-14, 'e' );
});
