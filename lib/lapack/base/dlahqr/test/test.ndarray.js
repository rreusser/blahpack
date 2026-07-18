/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlahqr from './../lib/ndarray.js';

// FIXTURES //

import real_eigenvalues_4x4 from './fixtures/real_eigenvalues_4x4.json' with { type: 'json' };
import complex_eigenvalues_4x4 from './fixtures/complex_eigenvalues_4x4.json' with { type: 'json' };
import triangular_3x3 from './fixtures/triangular_3x3.json' with { type: 'json' };
import eigenvalues_only_4x4 from './fixtures/eigenvalues_only_4x4.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import _2x2_complex from './fixtures/2x2_complex.json' with { type: 'json' };
import partial_range_6x6 from './fixtures/partial_range_6x6.json' with { type: 'json' };
import mixed_eigenvalues_5x5 from './fixtures/mixed_eigenvalues_5x5.json' with { type: 'json' };
import wantt_no_wantz_3x3 from './fixtures/wantt_no_wantz_3x3.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* IdentityMatrix.
*
* @private
* @param {*} N - N
* @returns {*} result
*/
function identityMatrix( N ) {
	const Z = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}
	return Z;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlahqr: real_eigenvalues_4x4', function t() {

	const tc = real_eigenvalues_4x4;
	const N = 4;
	const H = new Float64Array([
		4.0,
		1.0,
		0.0,
		0.0,
		3.0,
		4.0,
		1.0,
		0.0,
		2.0,
		3.0,
		4.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-13, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-13, 'wi' );
	assertArrayClose( toArray( H ), tc.h, 1e-13, 'h' );
	assertArrayClose( toArray( Z ), tc.z, 1e-13, 'z' );
});

test( 'dlahqr: complex_eigenvalues_4x4', function t() {

	const tc = complex_eigenvalues_4x4;
	const N = 4;
	const H = new Float64Array([
		0.0,
		1.0,
		0.0,
		0.0,
		-1.0,
		0.0,
		1.0,
		0.0,
		2.0,
		1.0,
		0.0,
		1.0,
		1.0,
		2.0,
		-1.0,
		0.0
	]);
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-13, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-13, 'wi' );
	assertArrayClose( toArray( H ), tc.h, 1e-13, 'h' );
	assertArrayClose( toArray( Z ), tc.z, 1e-13, 'z' );
});

test( 'dlahqr: triangular_3x3', function t() {

	const tc = triangular_3x3;
	const N = 3;
	const H = new Float64Array([
		1.0,
		0.0,
		0.0,
		2.0,
		4.0,
		0.0,
		3.0,
		5.0,
		6.0
	]);
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-14, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-14, 'wi' );
});

test( 'dlahqr: eigenvalues_only_4x4', function t() {

	const tc = eigenvalues_only_4x4;
	const N = 4;
	const H = new Float64Array([
		4.0,
		1.0,
		0.0,
		0.0,
		3.0,
		4.0,
		1.0,
		0.0,
		2.0,
		3.0,
		4.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-13, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-13, 'wi' );
});

test( 'dlahqr: ilo_eq_ihi', function t() {

	const tc = ilo_eq_ihi;
	const N = 4;
	const H = new Float64Array([
		5.0,
		0.0,
		0.0,
		0.0,
		3.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		3.0,
		0.0,
		1.0,
		2.0,
		1.0,
		7.0
	]);
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, false, N, 2, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( WR[ 1 ], tc.wr2, 1e-14, 'wr2' );
	assertClose( WI[ 1 ], tc.wi2, 1e-14, 'wi2' );
});

test( 'dlahqr: n0', function t() {

	const tc = n0;
	const H = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const info = dlahqr( true, true, 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 0, Z, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dlahqr: 2x2_complex', function t() {

	const tc = _2x2_complex;
	const N = 2;
	const H = new Float64Array([
		0.0,
		1.0,
		-2.0,
		0.0
	]);
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-14, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-14, 'wi' );
	assertArrayClose( toArray( H ), tc.h, 1e-14, 'h' );
	assertArrayClose( toArray( Z ), tc.z, 1e-14, 'z' );
});

test( 'dlahqr: partial_range_6x6', function t() {

	const tc = partial_range_6x6;
	const N = 6;
	const H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 10.0;
	H[ 0 + 1 * N ] = 1.0;
	H[ 0 + 2 * N ] = 2.0;
	H[ 0 + 3 * N ] = 3.0;
	H[ 0 + 4 * N ] = 4.0;
	H[ 0 + 5 * N ] = 5.0;
	H[ 1 + 1 * N ] = 4.0;
	H[ 1 + 2 * N ] = 3.0;
	H[ 1 + 3 * N ] = 1.0;
	H[ 1 + 4 * N ] = 0.5;
	H[ 1 + 5 * N ] = 0.1;
	H[ 2 + 1 * N ] = 1.0;
	H[ 2 + 2 * N ] = 3.0;
	H[ 2 + 3 * N ] = 2.0;
	H[ 2 + 4 * N ] = 1.0;
	H[ 2 + 5 * N ] = 0.2;
	H[ 3 + 2 * N ] = 0.5;
	H[ 3 + 3 * N ] = 2.0;
	H[ 3 + 4 * N ] = 1.5;
	H[ 3 + 5 * N ] = 0.3;
	H[ 4 + 3 * N ] = 0.25;
	H[ 4 + 4 * N ] = 1.0;
	H[ 4 + 5 * N ] = 0.4;
	H[ 5 + 5 * N ] = 20.0;
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 2, 5, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ).slice( 1, 5 ), tc.wr.slice( 1, 5 ), 1e-12, 'wr' ); // eslint-disable-line max-len
	assertArrayClose( toArray( WI ).slice( 1, 5 ), tc.wi.slice( 1, 5 ), 1e-12, 'wi' ); // eslint-disable-line max-len
	assertArrayClose( toArray( H ), tc.h, 1e-12, 'h' );
	assertArrayClose( toArray( Z ), tc.z, 1e-12, 'z' );
});

test( 'dlahqr: mixed_eigenvalues_5x5', function t() {

	const tc = mixed_eigenvalues_5x5;
	const N = 5;
	const H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 5.0;
	H[ 0 + 1 * N ] = 4.0;
	H[ 0 + 2 * N ] = 1.0;
	H[ 0 + 3 * N ] = 0.5;
	H[ 0 + 4 * N ] = 0.1;
	H[ 1 + 0 * N ] = 1.0;
	H[ 1 + 1 * N ] = 3.0;
	H[ 1 + 2 * N ] = 2.0;
	H[ 1 + 3 * N ] = 1.0;
	H[ 1 + 4 * N ] = 0.5;
	H[ 2 + 1 * N ] = 2.0;
	H[ 2 + 2 * N ] = 1.0;
	H[ 2 + 3 * N ] = 3.0;
	H[ 2 + 4 * N ] = 1.0;
	H[ 3 + 2 * N ] = 1.5;
	H[ 3 + 3 * N ] = 2.0;
	H[ 3 + 4 * N ] = 2.0;
	H[ 4 + 3 * N ] = 0.5;
	H[ 4 + 4 * N ] = 4.0;
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( toArray( H ), tc.h, 1e-12, 'h' );
	assertArrayClose( toArray( Z ), tc.z, 1e-12, 'z' );
});

test( 'dlahqr: wantt_no_wantz_3x3', function t() {

	const tc = wantt_no_wantz_3x3;
	const N = 3;
	const H = new Float64Array([
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		1.0,
		0.5,
		2.0,
		3.0
	]);
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dlahqr( true, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( WR ), tc.wr, 1e-13, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-13, 'wi' );
	assertArrayClose( toArray( H ), tc.h, 1e-13, 'h' );
});
