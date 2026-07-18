// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf2 from './../lib/ndarray.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_one_notposdef from './fixtures/n_one_notposdef.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zpotrf2: lower_3x3', function t() {
	const tc = lower_3x3;
	// A = [10 3-i 1+2i; 3+i 8 2-i; 1-2i 2+i 6] (col-major interleaved)
	const A = new Complex128Array( [
		10, 0, 3, 1, 1, -2,
		3, -1, 8, 0, 2, 1,
		1, 2, 2, -1, 6, 0
	] );
	const info = zpotrf2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf2: upper_3x3', function t() {
	const tc = upper_3x3;
	const A = new Complex128Array( [
		10, 0, 3, 1, 1, -2,
		3, -1, 8, 0, 2, 1,
		1, 2, 2, -1, 6, 0
	] );
	const info = zpotrf2( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf2: not_posdef', function t() {
	const tc = not_posdef;
	const A = new Complex128Array( [
		1, 0, 2, 1, 3, 0,
		2, -1, 1, 0, 4, 0,
		3, 0, 4, 0, 1, 0
	] );
	const info = zpotrf2( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotrf2: n_zero', function t() {
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const info = zpotrf2( 'lower', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotrf2: n_one', function t() {
	const tc = n_one;
	const A = new Complex128Array( [ 9, 0 ] );
	const info = zpotrf2( 'lower', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf2: n_one_notposdef', function t() {
	const tc = n_one_notposdef;
	const A = new Complex128Array( [ -4, 0 ] );
	const info = zpotrf2( 'lower', 1, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotrf2: lower_4x4', function t() {
	const tc = lower_4x4;
	const A = new Complex128Array( [
		14, 0, 4, 2, 2, -1, 1, 3,
		4, -2, 12, 0, 3, 1, 2, -2,
		2, 1, 3, -1, 10, 0, 1, 1,
		1, -3, 2, 2, 1, -1, 9, 0
	] );
	const info = zpotrf2( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf2: upper_4x4', function t() {
	const tc = upper_4x4;
	const A = new Complex128Array( [
		14, 0, 4, 2, 2, -1, 1, 3,
		4, -2, 12, 0, 3, 1, 2, -2,
		2, 1, 3, -1, 10, 0, 1, 1,
		1, -3, 2, 2, 1, -1, 9, 0
	] );
	const info = zpotrf2( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 1e-14, 'a' );
});

test( 'zpotrf2: upper_4x4 not posdef in A22 block', function t() {
	// 4x4 matrix where upper-left 2x2 is HPD but A22 block fails.
	const A = new Complex128Array( [
		4, 0, 2, 1, 1, 0, 1, 0,
		2, -1, 5, 0, 3, 0, 3, 0,
		1, 0, 3, 0, -1, 0, 0, 0,
		1, 0, 3, 0, 0, 0, -1, 0
	] );
	const info = zpotrf2( 'upper', 4, A, 1, 4, 0 );
	// n1 = 2, so if A22 fails at position k, info = k + n1
	assert.ok( info > 2, 'info should be > 2 (failure in A22 block), got ' + info );
});
