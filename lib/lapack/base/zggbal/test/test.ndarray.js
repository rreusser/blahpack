/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggbal from './../lib/ndarray.js';

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected 0, got ' + actual[ i ] ); // eslint-disable-line max-len
		} else {
			assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
		}
	}
}

/**
* Set complex element (i, j) in interleaved matrix (Float64 view).
*/
function cset( M, LDA, i, j, re, im ) {
	M[ j * 2 * LDA + i * 2 ] = re;
	M[ j * 2 * LDA + i * 2 + 1 ] = im;
}

/**
* Extract the complex matrix as a flat interleaved array (column-by-column).
*/
function extractCMatrix( V, LDA, n, m ) {
	const result = [];
	let i, j;
	for ( j = 0; j < m; j++ ) {
		for ( i = 0; i < n; i++ ) {
			result.push( V[ j * 2 * LDA + i * 2 ] );
			result.push( V[ j * 2 * LDA + i * 2 + 1 ] );
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zggbal: JOB=N, 4x4 — sets ilo=1, ihi=N, scales=1', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_n;
	const n = 4;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 2 );
	cset( Av, n, 0, 1, 3, 4 );
	cset( Av, n, 1, 0, 5, 6 );
	cset( Av, n, 1, 1, 7, 8 );
	cset( Av, n, 2, 2, 9, 0 );
	cset( Av, n, 3, 3, 1, 1 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	cset( Bv, n, 3, 3, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'none', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'zggbal: N=0 — quick return', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = n_zero;
	const A = new Complex128Array( 2 );
	const B = new Complex128Array( 2 );
	const lscale = new Float64Array( 1 );
	const rscale = new Float64Array( 1 );
	const work = new Float64Array( 6 );
	const result = zggbal( 'both', 0, A, 1, 1, 0, B, 1, 1, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
});

test( 'zggbal: N=1 — quick return with scales=1', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = n_one;
	const n = 1;
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	Av[ 0 ] = 5.0;
	Av[ 1 ] = 3.0;
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, 1, 0, B, 1, 1, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'zggbal: JOB=P, 4x4 — permute only', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_p;
	const n = 4;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 0 );
	cset( Av, n, 0, 1, 2, 0 );
	cset( Av, n, 1, 1, 3, 0 );
	cset( Av, n, 1, 2, 4, 0 );
	cset( Av, n, 2, 1, 5, 0 );
	cset( Av, n, 2, 2, 6, 0 );
	cset( Av, n, 3, 2, 7, 0 );
	cset( Av, n, 3, 3, 8, 0 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	cset( Bv, n, 3, 3, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=S, 3x3 — scale only', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_s;
	const n = 3;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1e3, 0 );
	cset( Av, n, 0, 1, 1, 0 );
	cset( Av, n, 0, 2, 1e-3, 0 );
	cset( Av, n, 1, 0, 1, 0 );
	cset( Av, n, 1, 1, 1, 0 );
	cset( Av, n, 1, 2, 1, 0 );
	cset( Av, n, 2, 0, 1e-3, 0 );
	cset( Av, n, 2, 1, 1, 0 );
	cset( Av, n, 2, 2, 1e3, 0 );
	cset( Bv, n, 0, 0, 1e3, 0 );
	cset( Bv, n, 0, 1, 1, 0 );
	cset( Bv, n, 0, 2, 1e-3, 0 );
	cset( Bv, n, 1, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 1, 2, 1, 0 );
	cset( Bv, n, 2, 0, 1e-3, 0 );
	cset( Bv, n, 2, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1e3, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'scale', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=B, 4x4 — both permute and scale', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_b;
	const n = 4;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 2 );
	cset( Av, n, 0, 1, 3, 1 );
	cset( Av, n, 0, 2, 0.1, 0 );
	cset( Av, n, 0, 3, 0.01, 0 );
	cset( Av, n, 1, 0, 4, 0.5 );
	cset( Av, n, 1, 1, 5, 3 );
	cset( Av, n, 1, 2, 2, 1 );
	cset( Av, n, 1, 3, 0.1, 0 );
	cset( Av, n, 2, 0, 0.1, 0 );
	cset( Av, n, 2, 1, 3, 2 );
	cset( Av, n, 2, 2, 6, 1 );
	cset( Av, n, 2, 3, 4, 0.5 );
	cset( Av, n, 3, 0, 0.01, 0 );
	cset( Av, n, 3, 1, 0.1, 0 );
	cset( Av, n, 3, 2, 3, 1 );
	cset( Av, n, 3, 3, 7, 2 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 0, 1, 0.5, 0 );
	cset( Bv, n, 0, 2, 0.01, 0 );
	cset( Bv, n, 0, 3, 0, 0 );
	cset( Bv, n, 1, 0, 0.5, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 1, 2, 0.5, 0 );
	cset( Bv, n, 1, 3, 0.01, 0 );
	cset( Bv, n, 2, 0, 0.01, 0 );
	cset( Bv, n, 2, 1, 0.5, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	cset( Bv, n, 2, 3, 0.5, 0 );
	cset( Bv, n, 3, 0, 0, 0 );
	cset( Bv, n, 3, 1, 0.01, 0 );
	cset( Bv, n, 3, 2, 0.5, 0 );
	cset( Bv, n, 3, 3, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=P, 3x3 — isolated eigenvalue', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_p_isolated;
	const n = 3;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 0 );
	cset( Av, n, 0, 1, 2, 0 );
	cset( Av, n, 1, 0, 3, 0 );
	cset( Av, n, 1, 1, 4, 0 );
	cset( Av, n, 2, 2, 5, 0 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 0, 1, 0.5, 0 );
	cset( Bv, n, 1, 0, 0.5, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=B, 5x5 — pentadiagonal with scaling', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_b_5x5;
	const n = 5;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1e2, 1 );
	cset( Av, n, 0, 1, 1, 0.5 );
	cset( Av, n, 0, 2, 1e-2, 0 );
	cset( Av, n, 1, 0, 1, 0 );
	cset( Av, n, 1, 1, 1e2, 2 );
	cset( Av, n, 1, 2, 1, 0.5 );
	cset( Av, n, 1, 3, 1e-2, 0 );
	cset( Av, n, 2, 0, 1e-2, 0 );
	cset( Av, n, 2, 1, 1, 0 );
	cset( Av, n, 2, 2, 1e2, 3 );
	cset( Av, n, 2, 3, 1, 0.5 );
	cset( Av, n, 2, 4, 1e-2, 0 );
	cset( Av, n, 3, 1, 1e-2, 0 );
	cset( Av, n, 3, 2, 1, 0 );
	cset( Av, n, 3, 3, 1e2, 4 );
	cset( Av, n, 3, 4, 1, 0.5 );
	cset( Av, n, 4, 2, 1e-2, 0 );
	cset( Av, n, 4, 3, 1, 0 );
	cset( Av, n, 4, 4, 1e2, 5 );
	cset( Bv, n, 0, 0, 1e2, 0 );
	cset( Bv, n, 1, 1, 1e2, 0 );
	cset( Bv, n, 2, 2, 1e2, 0 );
	cset( Bv, n, 3, 3, 1e2, 0 );
	cset( Bv, n, 4, 4, 1e2, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=P, 3x3 diagonal — fully isolated', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_p_diagonal;
	const n = 3;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 0 );
	cset( Av, n, 1, 1, 2, 0 );
	cset( Av, n, 2, 2, 3, 0 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'zggbal: JOB=S, 2x2 trivial — ilo=ihi quick return from scaling', function t() { // eslint-disable-line max-len
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_s_trivial;
	const n = 2;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 0 );
	cset( Av, n, 1, 1, 2, 0 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'scale', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
});

test( 'zggbal: JOB=B, 2x2 — complex dense', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_b_2x2;
	const n = 2;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 1 );
	cset( Av, n, 0, 1, 2, 3 );
	cset( Av, n, 1, 0, 4, 5 );
	cset( Av, n, 1, 1, 6, 7 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 0, 1, 0.5, 0 );
	cset( Bv, n, 1, 0, 0.5, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=P, 5x5 — two isolated eigenvalues', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_p_5x5;
	const n = 5;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 0 );
	cset( Av, n, 1, 1, 2, 1 );
	cset( Av, n, 1, 2, 3, 0 );
	cset( Av, n, 1, 3, 1, 0 );
	cset( Av, n, 2, 1, 4, 0 );
	cset( Av, n, 2, 2, 5, 2 );
	cset( Av, n, 2, 3, 2, 0 );
	cset( Av, n, 3, 1, 1, 0 );
	cset( Av, n, 3, 2, 3, 0 );
	cset( Av, n, 3, 3, 6, 1 );
	cset( Av, n, 4, 4, 7, 0 );
	cset( Bv, n, 0, 0, 1, 0 );
	cset( Bv, n, 1, 1, 1, 0 );
	cset( Bv, n, 2, 2, 1, 0 );
	cset( Bv, n, 3, 3, 1, 0 );
	cset( Bv, n, 4, 4, 1, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'permute', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=B, 3x3 — ilo===ihi after permutation', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const n = 3;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1.0, 0.0 );
	cset( Av, n, 0, 1, 2.0, 0.0 );
	cset( Av, n, 1, 1, 3.0, 0.0 );
	cset( Av, n, 2, 2, 4.0, 0.0 );
	cset( Bv, n, 0, 0, 1.0, 0.0 );
	cset( Bv, n, 1, 1, 1.0, 0.0 );
	cset( Bv, n, 2, 2, 1.0, 0.0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, 0, 'info' );
	assert.strictEqual( ilo[ 0 ], ihi[ 0 ], 'ilo === ihi' );
	assert.strictEqual( lscale[ ilo[ 0 ] - 1 ], 1.0, 'lscale at ilo is 1' );
	assert.strictEqual( rscale[ ilo[ 0 ] - 1 ], 1.0, 'rscale at ilo is 1' );
});

test( 'zggbal: JOB=B, 3x3 — fully dense complex', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );

	const tc = job_b_dense;
	const n = 3;
	const A = new Complex128Array( n * n );
	const B = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	cset( Av, n, 0, 0, 1, 1 );
	cset( Av, n, 0, 1, 2, 3 );
	cset( Av, n, 0, 2, 4, 5 );
	cset( Av, n, 1, 0, 6, 7 );
	cset( Av, n, 1, 1, 8, 9 );
	cset( Av, n, 1, 2, 10, 11 );
	cset( Av, n, 2, 0, 12, 13 );
	cset( Av, n, 2, 1, 14, 15 );
	cset( Av, n, 2, 2, 16, 17 );
	cset( Bv, n, 0, 0, 1, 0.5 );
	cset( Bv, n, 0, 1, 2, 1 );
	cset( Bv, n, 0, 2, 3, 1.5 );
	cset( Bv, n, 1, 0, 4, 2 );
	cset( Bv, n, 1, 1, 5, 2.5 );
	cset( Bv, n, 1, 2, 6, 3 );
	cset( Bv, n, 2, 0, 7, 3.5 );
	cset( Bv, n, 2, 1, 8, 4 );
	cset( Bv, n, 2, 2, 9, 4.5 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	const result = zggbal( 'both', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 );
	assert.strictEqual( result, tc.info, 'info' );
	assert.strictEqual( ilo[ 0 ], tc.ilo, 'ilo' );
	assert.strictEqual( ihi[ 0 ], tc.ihi, 'ihi' );
	assertArrayClose( toArray( lscale ), tc.lscale, 'lscale' );
	assertArrayClose( toArray( rscale ), tc.rscale, 'rscale' );
	assertArrayClose( extractCMatrix( Av, n, n, n ), tc.a, 'a' );
	assertArrayClose( extractCMatrix( Bv, n, n, n ), tc.b, 'b' );
});

test( 'zggbal: JOB=S, 3x3 — scaling iteration stops at the iteration limit (IT > NRP2)', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const n = 3;

	// Column-major (re, im) pairs; the conjugate gradient iteration works on log10(|re|+|im|) and on this pair runs past NRP2 = NR + 2 iterations without CMAX < 1/2, so it exits through the iteration limit (Fortran: IT > NRP2, falls through to label 350, where SFMIN is computed).
	const A0 = new Float64Array( [ 0.0, 0.0, 0.06, 0.04, 0.0, 0.0, 0.0, 0.0, 6.0, -4.0, 0.0, 0.0, 0.0, 0.0, 100.0, 0.0, 0.0, 100.0 ] ); // eslint-disable-line max-len
	const B0 = new Float64Array( [ 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1e5, 0.0, 0.0, 1e-5, 0.0, 0.0, 6e3, 4e3, -1e-6, 0.0 ] ); // eslint-disable-line max-len
	const A = new Complex128Array( A0 );
	const B = new Complex128Array( B0 );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const lscale = new Float64Array( n );
	const rscale = new Float64Array( n );
	const work = new Float64Array( 6 * n );
	let expected;
	let idx;
	let s;
	let i;
	let j;
	zggbal( 'scale', n, A, 1, n, 0, B, 1, n, 0, ilo, ihi, lscale, 1, 0, rscale, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( ilo[ 0 ], 1, 'ilo' );
	assert.strictEqual( ihi[ 0 ], n, 'ihi' );

	// Scale factors are finite integer powers of SCLFAC = 10...
	for ( i = 0; i < n; i++ ) {
		assert.strictEqual( lscale[ i ], Math.pow( 10, Math.round( Math.log10( lscale[ i ] ) ) ), 'lscale[' + i + ']' ); // eslint-disable-line max-len
		assert.strictEqual( rscale[ i ], Math.pow( 10, Math.round( Math.log10( rscale[ i ] ) ) ), 'rscale[' + i + ']' ); // eslint-disable-line max-len
	}

	// ...and the outputs are diag(LSCALE) * (A, B) * diag(RSCALE).
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			s = lscale[ i ] * rscale[ j ];
			for ( idx = 2 * ( i + ( j * n ) ); idx < 2 * ( i + ( j * n ) ) + 2; idx++ ) { // eslint-disable-line max-len
				expected = A0[ idx ] * s;
				assert.ok( Math.abs( Av[ idx ] - expected ) <= 1e-14 * Math.abs( expected ), 'a[' + idx + ']' ); // eslint-disable-line max-len
				expected = B0[ idx ] * s;
				assert.ok( Math.abs( Bv[ idx ] - expected ) <= 1e-14 * Math.abs( expected ), 'b[' + idx + ']' ); // eslint-disable-line max-len
			}
		}
	}
});
