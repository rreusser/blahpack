/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbal from './../lib/ndarray.js';

// FIXTURES //

import job_n from './fixtures/job_n.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import job_p from './fixtures/job_p.json' with { type: 'json' };
import job_s from './fixtures/job_s.json' with { type: 'json' };
import job_b from './fixtures/job_b.json' with { type: 'json' };
import job_p_isolated from './fixtures/job_p_isolated.json' with { type: 'json' };
import job_b_5x5 from './fixtures/job_b_5x5.json' with { type: 'json' };
import job_p_diagonal from './fixtures/job_p_diagonal.json' with { type: 'json' };
import job_s_trivial from './fixtures/job_s_trivial.json' with { type: 'json' };
import job_b_2x2 from './fixtures/job_b_2x2.json' with { type: 'json' };
import job_p_5x5 from './fixtures/job_p_5x5.json' with { type: 'json' };
import job_b_dense from './fixtures/job_b_dense.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i += 1 ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected 0, got ' + actual[ i ] ); // eslint-disable-line max-len
		} else {
			assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
		}
	}
}

/**
* Build a column-major Float64Array from column arrays.
*
* @private
* @param {number} N - matrix order
* @param {Array<Array<number>>} cols - array of column arrays (each length N)
* @returns {Float64Array} column-major matrix
*/
function buildMatrix( N, cols ) {
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < cols.length; j += 1 ) {
		for ( i = 0; i < N; i += 1 ) {
			out[ i + ( j * N ) ] = cols[ j ][ i ];
		}
	}
	return out;
}

/**
* Extract the real matrix as a flat array (column-by-column).
*
* @private
* @param {Float64Array} M - matrix data
* @param {integer} LDA - leading dimension
* @param {integer} n - number of rows
* @param {integer} m - number of columns
* @returns {Array} flat array
*/
function extractMatrix( M, LDA, n, m ) {
	var result = [];
	var i;
	var j;
	for ( j = 0; j < m; j += 1 ) {
		for ( i = 0; i < n; i += 1 ) {
			result.push( M[ ( j * LDA ) + i ] );
		}
	}
	return result;
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
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dggbal is a function', function t() {
	assert.strictEqual( typeof dggbal, 'function', 'is a function' );
});

test( 'dggbal: JOB=none, 4x4 - sets ilo=1, ihi=N, scales=1', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_n;
	n = 4;
	A = buildMatrix( n, [
		[ 1, 5, 0, 0 ],
		[ 3, 7, 0, 0 ],
		[ 0, 0, 9, 0 ],
		[ 0, 0, 0, 1 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0, 0, 0 ],
		[ 0, 1, 0, 0 ],
		[ 0, 0, 1, 0 ],
		[ 0, 0, 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'none', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'dggbal: N=0 - quick return', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Float64Array( 2 );
	B = new Float64Array( 2 );
	lscale = new Float64Array( 1 );
	rscale = new Float64Array( 1 );
	work = new Float64Array( 6 );
	result = dggbal( 'both', 0, A, 1, 1, 0, B, 1, 1, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
});

test( 'dggbal: N=1 - quick return with scales=1', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = n_one;
	n = 1;
	A = new Float64Array( [ 5.0 ] );
	B = new Float64Array( [ 1.0 ] );
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'both', n, A, 1, 1, 0, B, 1, 1, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'dggbal: JOB=permute, 4x4 - permute only', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_p;
	n = 4;
	A = buildMatrix( n, [
		[ 1, 0, 0, 0 ],
		[ 2, 3, 5, 0 ],
		[ 0, 4, 6, 7 ],
		[ 0, 0, 0, 8 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0, 0, 0 ],
		[ 0, 1, 0, 0 ],
		[ 0, 0, 1, 0 ],
		[ 0, 0, 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=scale, 3x3 - scale only', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_s;
	n = 3;
	A = buildMatrix( n, [
		[ 1e3, 1, 1e-3 ],
		[ 1, 1, 1 ],
		[ 1e-3, 1, 1e3 ]
	]);
	B = buildMatrix( n, [
		[ 1e3, 1, 1e-3 ],
		[ 1, 1, 1 ],
		[ 1e-3, 1, 1e3 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'scale', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=both, 4x4 - both permute and scale', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_b;
	n = 4;
	A = buildMatrix( n, [
		[ 1, 4, 0.1, 0.01 ],
		[ 3, 5, 3, 0.1 ],
		[ 0.1, 2, 6, 3 ],
		[ 0.01, 0.1, 4, 7 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0.5, 0.01, 0 ],
		[ 0.5, 1, 0.5, 0.01 ],
		[ 0.01, 0.5, 1, 0.5 ],
		[ 0, 0.01, 0.5, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=permute, 3x3 - isolated eigenvalue', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_p_isolated;
	n = 3;
	A = buildMatrix( n, [
		[ 1, 3, 0 ],
		[ 2, 4, 0 ],
		[ 0, 0, 5 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0.5, 0 ],
		[ 0.5, 1, 0 ],
		[ 0, 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=both, 5x5 - scaling iteration', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_b_5x5;
	n = 5;
	A = buildMatrix( n, [
		[ 1e2, 1, 1e-2, 0, 0 ],
		[ 1, 1e2, 1, 1e-2, 0 ],
		[ 1e-2, 1, 1e2, 1, 1e-2 ],
		[ 0, 1e-2, 1, 1e2, 1 ],
		[ 0, 0, 1e-2, 1, 1e2 ]
	]);
	B = buildMatrix( n, [
		[ 1e2, 0, 0, 0, 0 ],
		[ 0, 1e2, 0, 0, 0 ],
		[ 0, 0, 1e2, 0, 0 ],
		[ 0, 0, 0, 1e2, 0 ],
		[ 0, 0, 0, 0, 1e2 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=permute, 3x3 diagonal - everything isolated', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_p_diagonal;
	n = 3;
	A = buildMatrix( n, [
		[ 1, 0, 0 ],
		[ 0, 2, 0 ],
		[ 0, 0, 3 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0, 0 ],
		[ 0, 1, 0 ],
		[ 0, 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'dggbal: JOB=scale, 2x2 diagonal - trivial scaling', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_s_trivial;
	n = 2;
	A = buildMatrix( n, [
		[ 1, 0 ],
		[ 0, 2 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0 ],
		[ 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'scale', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'dggbal: JOB=both, 2x2 dense', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_b_2x2;
	n = 2;
	A = buildMatrix( n, [
		[ 1, 4 ],
		[ 2, 6 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0.5 ],
		[ 0.5, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=permute, 5x5 with two isolated rows/cols', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_p_5x5;
	n = 5;
	A = buildMatrix( n, [
		[ 1, 0, 0, 0, 0 ],
		[ 0, 2, 4, 1, 0 ],
		[ 0, 3, 5, 3, 0 ],
		[ 0, 1, 2, 6, 0 ],
		[ 0, 0, 0, 0, 7 ]
	]);
	B = buildMatrix( n, [
		[ 1, 0, 0, 0, 0 ],
		[ 0, 1, 0, 0, 0 ],
		[ 0, 0, 1, 0, 0 ],
		[ 0, 0, 0, 1, 0 ],
		[ 0, 0, 0, 0, 1 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});

test( 'dggbal: JOB=both, 3x3 fully dense', function t() {
	var result;
	var lscale;
	var rscale;
	var work;
	var tc;
	var n;
	var A;
	var B;

	tc = job_b_dense;
	n = 3;
	A = buildMatrix( n, [
		[ 1, 6, 12 ],
		[ 2, 8, 14 ],
		[ 4, 10, 16 ]
	]);
	B = buildMatrix( n, [
		[ 1, 4, 7 ],
		[ 2, 5, 8 ],
		[ 3, 6, 9 ]
	]);
	lscale = new Float64Array( n );
	rscale = new Float64Array( n );
	work = new Float64Array( 6 * n );
	result = dggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result.info, tc.info, 'info' );
	assert.strictEqual( result.ilo, tc.ilo, 'ilo' );
	assert.strictEqual( result.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractMatrix( A, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractMatrix( B, n, n, n ), tc.b, 'b' );
});
