/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgesvd from './../lib/ndarray.js';
import { computeMinWorkSize, computeWorkSize } from './../lib/base.js';

// FIXTURES //

import full_1x1 from './fixtures/full_1x1.json' with { type: 'json' };
import full_2x2 from './fixtures/full_2x2.json' with { type: 'json' };
import full_3x3 from './fixtures/full_3x3.json' with { type: 'json' };
import values_only_3x4 from './fixtures/values_only_3x4.json' with { type: 'json' };
import economy_4x3 from './fixtures/economy_4x3.json' with { type: 'json' };
import full_3x5 from './fixtures/full_3x5.json' with { type: 'json' };
import economy_u_full_vt_5x3 from './fixtures/economy_u_full_vt_5x3.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* AssertSingularValuesClose.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertSingularValuesClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* C128.
*
* @private
* @param {TypedArray} arr - input array
* @returns {*} result
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ).buffer );
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

test( 'zgesvd: m_zero (quick return)', function t() {

	const RWORK = new Float64Array( 10 );
	const WORK = new Complex128Array( 50 );
	const s = new Float64Array( 1 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const info = zgesvd( 'none', 'none', 0, 3, A, 1, 1, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zgesvd: n_zero (quick return)', function t() {

	const RWORK = new Float64Array( 10 );
	const WORK = new Complex128Array( 50 );
	const s = new Float64Array( 1 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );
	const info = zgesvd( 'none', 'none', 3, 0, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zgesvd: full_1x1', function t() {

	const tc = full_1x1;
	const RWORK = new Float64Array( 50 );
	const WORK = new Complex128Array( 100 );
	const s = new Float64Array( 1 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = c128( [ 5.0, 3.0 ] );
	const info = zgesvd( 'all-columns', 'all-rows', 1, 1, A, 1, 1, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: full_2x2', function t() {

	const tc = full_2x2;
	const RWORK = new Float64Array( 50 );
	const WORK = new Complex128Array( 500 );
	const s = new Float64Array( 2 );
	const U = new Complex128Array( 4 );
	const VT = new Complex128Array( 4 );
	const A = c128([
		3.0,
		1.0,
		1.0,
		2.0,  // column 1: (3+1i), (1+2i)
		2.0,
		0.0,
		4.0,
		1.0   // column 2: (2+0i), (4+1i)
	]);
	const info = zgesvd( 'all-columns', 'all-rows', 2, 2, A, 1, 2, 0, s, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: full_3x3', function t() {

	const tc = full_3x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 9 );
	const A = c128([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0,  // col 1
		7.0,
		8.0,
		9.0,
		1.0,
		2.0,
		3.0,  // col 2
		4.0,
		5.0,
		6.0,
		7.0,
		8.0,
		9.0   // col 3
	]);
	const info = zgesvd( 'all-columns', 'all-rows', 3, 3, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: values_only_3x4 (JOBU=N, JOBVT=N)', function t() {

	const tc = values_only_3x4;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		2.0,
		3.0,
		0.0,
		0.0,
		1.0,  // col 1
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,  // col 2
		3.0,
		0.0,
		1.0,
		2.0,
		0.0,
		2.0,  // col 3
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		1.0   // col 4
	]);
	const info = zgesvd( 'none', 'none', 3, 4, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: economy_4x3 (JOBU=S, JOBVT=S)', function t() {

	const tc = economy_4x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 12 );
	const VT = new Complex128Array( 9 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,  // col 1
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,  // col 2
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0   // col 3
	]);
	const info = zgesvd( 'economy', 'economy', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 4, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: full_3x5 (M < N, JOBU=A, JOBVT=A)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 25 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,  // col 1
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,  // col 2
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,  // col 3
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,  // col 4
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0   // col 5
	]);
	const info = zgesvd( 'all-columns', 'all-rows', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: economy_u_full_vt_5x3 (JOBU=S, JOBVT=A)', function t() {

	const tc = economy_u_full_vt_5x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 15 );
	const VT = new Complex128Array( 9 );
	const A = c128([
		1.0,
		1.0,
		2.0,
		0.0,
		0.0,
		1.0,
		3.0,
		2.0,
		1.0,
		1.0,  // col 1
		0.0,
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		2.0,
		0.0,
		0.0,
		3.0,  // col 2
		2.0,
		1.0,
		0.0,
		1.0,
		1.0,
		2.0,
		1.0,
		0.0,
		2.0,
		2.0   // col 3
	]);
	const info = zgesvd( 'economy', 'all-rows', 5, 3, A, 1, 5, 0, s, 1, 0, U, 1, 5, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x3 reconstruction U*S*VT ~ A', function t() {
	let maxErr, errR, errI, vtR, vtI, re, im, uR, uI, sk, i, j, k;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 9 );
	const A_orig_f64 = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0,
		7.0,
		8.0,
		9.0,
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0,
		7.0,
		8.0,
		9.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const M = 3;
	const N = 3;
	const minmn = 3;
	const info = zgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	const Uv = reinterpret( U, 0 );
	const VTv = reinterpret( VT, 0 );
	maxErr = 0.0;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < minmn; k++ ) {
				// U(i,k) * s(k) * VT(k,j)
				uR = Uv[ 2 * ( i + k * M ) ];
				uI = Uv[ 2 * ( i + k * M ) + 1 ];
				vtR = VTv[ 2 * ( k + j * N ) ];
				vtI = VTv[ 2 * ( k + j * N ) + 1 ];
				sk = s[ k ];

				// (uR + uI*i) * sk * (vtR + vtI*i)
				re += sk * ( uR * vtR - uI * vtI );
				im += sk * ( uR * vtI + uI * vtR );
			}
			errR = Math.abs( re - A_orig_f64[ 2 * ( i + j * M ) ] );
			errI = Math.abs( im - A_orig_f64[ 2 * ( i + j * M ) + 1 ] );
			maxErr = Math.max( maxErr, errR, errI );
		}
	}
	assert.ok( maxErr < 1e-10, 'reconstruction error: ' + maxErr );
});

test( 'zgesvd: 3x4 values only, M < N', function t() {

	const tc = values_only_3x4;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		2.0,
		3.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		3.0,
		0.0,
		1.0,
		2.0,
		0.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		1.0
	]);
	const info = zgesvd( 'none', 'none', 3, 4, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=N JOBVT=N (M > N, values only)', function t() {

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const tc = economy_4x3;
	const info = zgesvd( 'none', 'none', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=A JOBVT=N (M > N, U only)', function t() {

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 16 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const tc = economy_4x3;
	const info = zgesvd( 'all-columns', 'none', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 4, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=N JOBVT=A (M > N, VT only)', function t() {

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 9 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const tc = economy_4x3;
	const info = zgesvd( 'none', 'all-rows', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=N JOBVT=S (M < N, VT economy only)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 15 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'none', 'economy', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=S JOBVT=N (M < N, U economy only)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'economy', 'none', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=A JOBVT=N (M < N, full U only)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'all-columns', 'none', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=N JOBVT=A (M < N, full VT only)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 25 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'none', 'all-rows', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 2x2 reconstruction', function t() {
	let maxErr, errR, errI, vtR, vtI, re, im, uR, uI, sk, i, j, k;

	const RWORK = new Float64Array( 50 );
	const WORK = new Complex128Array( 500 );
	const s = new Float64Array( 2 );
	const U = new Complex128Array( 4 );
	const VT = new Complex128Array( 4 );
	const A_orig_f64 = new Float64Array([
		3.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		4.0,
		1.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const M = 2;
	const N = 2;
	const info = zgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	const Uv = reinterpret( U, 0 );
	const VTv = reinterpret( VT, 0 );
	maxErr = 0.0;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < Math.min( M, N ); k++ ) {
				uR = Uv[ 2 * ( i + k * M ) ];
				uI = Uv[ 2 * ( i + k * M ) + 1 ];
				vtR = VTv[ 2 * ( k + j * N ) ];
				vtI = VTv[ 2 * ( k + j * N ) + 1 ];
				sk = s[ k ];
				re += sk * ( uR * vtR - uI * vtI );
				im += sk * ( uR * vtI + uI * vtR );
			}
			errR = Math.abs( re - A_orig_f64[ 2 * ( i + j * M ) ] );
			errI = Math.abs( im - A_orig_f64[ 2 * ( i + j * M ) + 1 ] );
			maxErr = Math.max( maxErr, errR, errI );
		}
	}
	assert.ok( maxErr < 1e-10, 'reconstruction error: ' + maxErr );
});

test( 'zgesvd: 4x3 JOBU=A JOBVT=S reconstruction', function t() {
	let maxErr, errR, errI, vtR, vtI, re, im, uR, uI, sk, i, j, k;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 16 );
	const VT = new Complex128Array( 9 );
	const M = 4;
	const N = 3;
	const A_orig_f64 = new Float64Array([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const minmn = Math.min( M, N );
	const info = zgesvd( 'all-columns', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	const Uv = reinterpret( U, 0 );
	const VTv = reinterpret( VT, 0 );
	maxErr = 0.0;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < minmn; k++ ) {
				uR = Uv[ 2 * ( i + k * M ) ];
				uI = Uv[ 2 * ( i + k * M ) + 1 ];
				vtR = VTv[ 2 * ( k + j * minmn ) ];
				vtI = VTv[ 2 * ( k + j * minmn ) + 1 ];
				sk = s[ k ];
				re += sk * ( uR * vtR - uI * vtI );
				im += sk * ( uR * vtI + uI * vtR );
			}
			errR = Math.abs( re - A_orig_f64[ 2 * ( i + j * M ) ] );
			errI = Math.abs( im - A_orig_f64[ 2 * ( i + j * M ) + 1 ] );
			maxErr = Math.max( maxErr, errR, errI );
		}
	}
	assert.ok( maxErr < 1e-10, 'reconstruction error: ' + maxErr );
});

test( 'zgesvd: 3x5 JOBU=A JOBVT=A reconstruction (M < N)', function t() {
	let maxErr, errR, errI, vtR, vtI, re, im, uR, uI, sk, i, j, k;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 25 );
	const M = 3;
	const N = 5;
	const A_orig_f64 = new Float64Array([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const minmn = Math.min( M, N );
	const info = zgesvd( 'all-columns', 'all-rows', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	const Uv = reinterpret( U, 0 );
	const VTv = reinterpret( VT, 0 );
	maxErr = 0.0;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < minmn; k++ ) {
				uR = Uv[ 2 * ( i + k * M ) ];
				uI = Uv[ 2 * ( i + k * M ) + 1 ];
				vtR = VTv[ 2 * ( k + j * N ) ];
				vtI = VTv[ 2 * ( k + j * N ) + 1 ];
				sk = s[ k ];
				re += sk * ( uR * vtR - uI * vtI );
				im += sk * ( uR * vtI + uI * vtR );
			}
			errR = Math.abs( re - A_orig_f64[ 2 * ( i + j * M ) ] );
			errI = Math.abs( im - A_orig_f64[ 2 * ( i + j * M ) + 1 ] );
			maxErr = Math.max( maxErr, errR, errI );
		}
	}
	assert.ok( maxErr < 1e-10, 'reconstruction error: ' + maxErr );
});

test( 'zgesvd: 6x3 JOBU=N JOBVT=N (M >= 2N path 1, values only)', function t() {

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const sRef = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A_orig_f64 = new Float64Array([
		1.0,
		0.0,
		2.0,
		1.0,
		0.0,
		1.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		1.0,
		1.0,
		2.0,
		1.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0,
		3.0,
		0.0,
		1.0,
		2.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const Aref = c128( toArray( A_orig_f64 ) );
	const Uref = new Complex128Array( 36 );
	const VTref = new Complex128Array( 9 );
	const infoRef = zgesvd( 'all-columns', 'all-rows', 6, 3, Aref, 1, 6, 0, sRef, 1, 0, Uref, 1, 6, 0, VTref, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( infoRef, 0, 'ref info' );
	const info = zgesvd( 'none', 'none', 6, 3, A, 1, 6, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), toArray( sRef ), 1e-12, 's' );
});

test( 'zgesvd: 6x3 JOBU=N JOBVT=S (M >= 2N path 1, VT economy)', function t() {

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const sRef = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 9 );
	const A_orig_f64 = new Float64Array([
		1.0,
		0.0,
		2.0,
		1.0,
		0.0,
		1.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		1.0,
		1.0,
		2.0,
		1.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0,
		3.0,
		0.0,
		1.0,
		2.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const Aref = c128( toArray( A_orig_f64 ) );
	const Uref = new Complex128Array( 36 );
	const VTref = new Complex128Array( 9 );
	zgesvd( 'all-columns', 'all-rows', 6, 3, Aref, 1, 6, 0, sRef, 1, 0, Uref, 1, 6, 0, VTref, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const info = zgesvd( 'none', 'economy', 6, 3, A, 1, 6, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), toArray( sRef ), 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=N JOBVT=N (M >= N, values only, path 10)', function t() { // eslint-disable-line max-len

	const tc = economy_4x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 1000 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const info = zgesvd( 'none', 'none', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=O JOBVT=S (M >= N, overwrite A with U)', function t() {

	const tc = economy_4x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 9 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const info = zgesvd( 'overwrite', 'economy', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 4x3 JOBU=S JOBVT=O (M >= N, overwrite A with VT)', function t() {

	const tc = economy_4x3;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 12 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		3.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		1.0
	]);
	const info = zgesvd( 'economy', 'overwrite', 4, 3, A, 1, 4, 0, s, 1, 0, U, 1, 4, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=O JOBVT=S (M < N, overwrite A with U)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 1 );
	const VT = new Complex128Array( 15 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'overwrite', 'economy', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 1, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=S JOBVT=O (M < N, overwrite A with VT)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 1 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'economy', 'overwrite', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=S JOBVT=S (M < N, economy SVD)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 15 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'economy', 'economy', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: 3x5 JOBU=A JOBVT=S (M < N, full U, economy VT)', function t() {

	const tc = full_3x5;
	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 9 );
	const VT = new Complex128Array( 15 );
	const A = c128([
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		0.0,
		1.0,
		1.0,
		4.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		1.0,
		1.0,
		2.0,
		2.0,
		0.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.0,
		1.0,
		3.0,
		1.0
	]);
	const info = zgesvd( 'all-columns', 'economy', 3, 5, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( toArray( s ), tc.s, 1e-12, 's' );
});

test( 'zgesvd: very small matrix triggers scaling path', function t() {
	let info;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 2 );
	const sRef = new Float64Array( 2 );
	const U = new Complex128Array( 4 );
	const VT = new Complex128Array( 4 );
	const scale = 1e-160;
	const A1 = c128( [ 3.0*scale, 1.0*scale, 1.0*scale, 2.0*scale, 2.0*scale, 0.0, 4.0*scale, 1.0*scale ] ); // eslint-disable-line max-len
	const A2 = c128( [ 3.0, 1.0, 1.0, 2.0, 2.0, 0.0, 4.0, 1.0 ] );
	info = zgesvd( 'all-columns', 'all-rows', 2, 2, A2, 1, 2, 0, sRef, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'ref info' );
	info = zgesvd( 'all-columns', 'all-rows', 2, 2, A1, 1, 2, 0, s, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( [ s[0] / scale, s[1] / scale ], toArray( sRef ), 1e-8, 'scaled s' ); // eslint-disable-line max-len
});

test( 'zgesvd: very large matrix triggers scaling path', function t() {
	let info;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 2 );
	const sRef = new Float64Array( 2 );
	const U = new Complex128Array( 4 );
	const VT = new Complex128Array( 4 );
	const scale = 1e160;
	const A1 = c128( [ 3.0*scale, 1.0*scale, 1.0*scale, 2.0*scale, 2.0*scale, 0.0, 4.0*scale, 1.0*scale ] ); // eslint-disable-line max-len
	const A2 = c128( [ 3.0, 1.0, 1.0, 2.0, 2.0, 0.0, 4.0, 1.0 ] );
	info = zgesvd( 'all-columns', 'all-rows', 2, 2, A2, 1, 2, 0, sRef, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'ref info' );
	info = zgesvd( 'all-columns', 'all-rows', 2, 2, A1, 1, 2, 0, s, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertSingularValuesClose( [ s[0] / scale, s[1] / scale ], toArray( sRef ), 1e-8, 'scaled s' ); // eslint-disable-line max-len
});

test( 'zgesvd: WORK one element below the reference minimum 2*min(M,N)+max(M,N) throws a RangeError', function t() {
	let RWORK, WORK, VT, s, U, A;

	RWORK = new Float64Array( 50 );
	WORK = new Complex128Array( 5 );
	s = new Float64Array( 2 );
	U = new Complex128Array( 4 );
	VT = new Complex128Array( 4 );
	A = c128( [ 3.0, 1.0, 1.0, 2.0, 2.0, 0.0, 4.0, 1.0 ] );
	assert.throws( function throws() {
		zgesvd( 'all-columns', 'all-rows', 2, 2, A, 1, 2, 0, s, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError, 'throws for undersized WORK' );
});

test( 'zgesvd: undersized RWORK throws a RangeError', function t() {
	let RWORK, WORK, VT, s, U, A;

	RWORK = new Float64Array( 1 );
	WORK = new Complex128Array( 100 );
	s = new Float64Array( 2 );
	U = new Complex128Array( 4 );
	VT = new Complex128Array( 4 );
	A = c128( [ 3.0, 1.0, 1.0, 2.0, 2.0, 0.0, 4.0, 1.0 ] );
	assert.throws( function throws() {
		zgesvd( 'all-columns', 'all-rows', 2, 2, A, 1, 2, 0, s, 1, 0, U, 1, 2, 0, VT, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError, 'throws for undersized RWORK' );
});

test( 'zgesvd: 5x3 JOBU=S JOBVT=S reconstruction', function t() {
	let maxErr, errR, errI, vtR, vtI, re, im, uR, uI, sk, i, j, k;

	const RWORK = new Float64Array( 100 );
	const WORK = new Complex128Array( 2500 );
	const s = new Float64Array( 3 );
	const U = new Complex128Array( 15 );
	const VT = new Complex128Array( 9 );
	const M = 5;
	const N = 3;
	const A_orig_f64 = new Float64Array([
		1.0,
		1.0,
		2.0,
		0.0,
		0.0,
		1.0,
		3.0,
		2.0,
		1.0,
		1.0,
		0.0,
		2.0,
		1.0,
		0.0,
		3.0,
		1.0,
		2.0,
		0.0,
		0.0,
		3.0,
		2.0,
		1.0,
		0.0,
		1.0,
		1.0,
		2.0,
		1.0,
		0.0,
		2.0,
		2.0
	]);
	const A = c128( toArray( A_orig_f64 ) );
	const minmn = Math.min( M, N );
	const info = zgesvd( 'economy', 'economy', M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, minmn, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	const Uv = reinterpret( U, 0 );
	const VTv = reinterpret( VT, 0 );
	maxErr = 0.0;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < minmn; k++ ) {
				uR = Uv[ 2 * ( i + k * M ) ];
				uI = Uv[ 2 * ( i + k * M ) + 1 ];
				vtR = VTv[ 2 * ( k + j * minmn ) ];
				vtI = VTv[ 2 * ( k + j * minmn ) + 1 ];
				sk = s[ k ];
				re += sk * ( uR * vtR - uI * vtI );
				im += sk * ( uR * vtI + uI * vtR );
			}
			errR = Math.abs( re - A_orig_f64[ 2 * ( i + j * M ) ] );
			errI = Math.abs( im - A_orig_f64[ 2 * ( i + j * M ) + 1 ] );
			maxErr = Math.max( maxErr, errR, errI );
		}
	}
	assert.ok( maxErr < 1e-10, 'reconstruction error: ' + maxErr );
});


// WORKSPACE-ADAPTIVE PATHS (ticket 0100) //

const JOBUS = [ 'all-columns', 'economy', 'overwrite', 'none' ];
const JOBVTS = [ 'all-rows', 'economy', 'overwrite', 'none' ];
const SHAPES = [ [ 70, 40 ], [ 45, 40 ], [ 40, 70 ], [ 40, 45 ] ];

/**
* Returns a deterministic pseudo-random M-by-N column-major complex matrix as interleaved real and imaginary parts.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Float64Array} interleaved matrix
*/
function randomMatrix( M, N ) {
	const A = new Float64Array( 2 * M * N );
	let seed = 54321;
	let i;
	for ( i = 0; i < 2 * M * N; i++ ) {
		seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
		A[ i ] = ( seed / 2147483648 ) - 0.5;
	}
	return A;
}

/**
* Runs zgesvd with a WORK of exactly `lwork` complex elements (from offset 2) and returns its singular values and vectors.
*
* @private
* @param {string} jobu - left option
* @param {string} jobvt - right option
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {PositiveInteger} lwork - workspace length
* @returns {Object} `s`, `left` (M-by-minmn interleaved, or null), `right` (minmn-by-N, LD minmn, interleaved, or null), `Ufull`, `VTfull`
*/
function svdAt( jobu, jobvt, M, N, lwork ) {
	const minmn = Math.min( M, N );
	const A = new Complex128Array( randomMatrix( M, N ) );
	const Av = reinterpret( A, 0 );
	const s = new Float64Array( minmn );
	const ucol = ( jobu === 'all-columns' ) ? M : minmn;
	const U = new Complex128Array( M * ucol );
	const VT = new Complex128Array( N * N );
	const VTv = reinterpret( VT, 0 );
	const WORK = new Complex128Array( lwork + 2 );
	const RWORK = new Float64Array( 5 * minmn );
	let right = null;
	let left = null;
	let src;
	let i;
	let j;
	const info = zgesvd( jobu, jobvt, M, N, A, 1, M, 0, s, 1, 0, U, 1, M, 0, VT, 1, N, 0, WORK, 1, 2, RWORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	if ( jobu === 'overwrite' ) {
		left = Av.slice( 0, 2 * M * minmn );
	} else if ( jobu !== 'none' ) {
		left = reinterpret( U, 0 ).slice( 0, 2 * M * minmn );
	}
	if ( jobvt !== 'none' ) {
		right = new Float64Array( 2 * minmn * N );
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < minmn; i++ ) {
				src = ( jobvt === 'overwrite' ) ? Av : VTv;
				right[ 2 * ( i + ( j * minmn ) ) ] = src[ 2 * ( i + ( j * ( ( jobvt === 'overwrite' ) ? M : N ) ) ) ];
				right[ ( 2 * ( i + ( j * minmn ) ) ) + 1 ] = src[ ( 2 * ( i + ( j * ( ( jobvt === 'overwrite' ) ? M : N ) ) ) ) + 1 ];
			}
		}
	}
	return {
		's': s,
		'left': left,
		'right': right,
		'Ufull': ( jobu === 'all-columns' ) ? reinterpret( U, 0 ) : null,
		'VTfull': ( jobvt === 'all-rows' ) ? VTv : null
	};
}

/**
* Returns `conj(x)^T y` over `n` elements of two interleaved complex arrays, each read with its own stride and offset (in complex elements).
*
* @private
* @param {NonNegativeInteger} n - number of elements
* @param {Float64Array} x - first array
* @param {integer} sx - stride of x
* @param {NonNegativeInteger} ox - offset of x
* @param {Float64Array} y - second array
* @param {integer} sy - stride of y
* @param {NonNegativeInteger} oy - offset of y
* @returns {Array<number>} real and imaginary parts
*/
function cdot( n, x, sx, ox, y, sy, oy ) {
	let re = 0.0;
	let im = 0.0;
	let xr;
	let xi;
	let yr;
	let yi;
	let k;
	for ( k = 0; k < n; k++ ) {
		xr = x[ 2 * ( ox + ( k * sx ) ) ];
		xi = x[ ( 2 * ( ox + ( k * sx ) ) ) + 1 ];
		yr = y[ 2 * ( oy + ( k * sy ) ) ];
		yi = y[ ( 2 * ( oy + ( k * sy ) ) ) + 1 ];
		re += ( xr * yr ) + ( xi * yi );
		im += ( xr * yi ) - ( xi * yr );
	}
	return [ re, im ];
}

/**
* Asserts the columns (`cols` true) or rows of a column-major complex matrix are orthonormal.
*
* @private
* @param {boolean} cols - check columns (else rows)
* @param {NonNegativeInteger} R - rows
* @param {NonNegativeInteger} C - columns
* @param {Float64Array} X - interleaved matrix
* @param {PositiveInteger} LD - leading dimension
* @param {number} tol - tolerance
* @param {string} msg - label
*/
function assertOrthonormal( cols, R, C, X, LD, tol, msg ) {
	const K = ( cols ) ? C : R;
	const L = ( cols ) ? R : C;
	let d;
	let j;
	let k;
	for ( j = 0; j < K; j++ ) {
		for ( k = j; k < K; k++ ) {
			d = ( cols ) ? cdot( L, X, 1, j * LD, X, 1, k * LD ) : cdot( L, X, LD, j, X, LD, k );
			assert.ok( Math.abs( d[ 0 ] - ( ( j === k ) ? 1.0 : 0.0 ) ) <= tol && Math.abs( d[ 1 ] ) <= tol, msg + ': ' + j + ' . ' + k + ' = ' + d );
		}
	}
}

/**
* Checks one run by property: singular values against the optimum's, orthonormal vectors, each vector equal to the optimum's up to a unit phase, and `A = U*S*V^H` (or `|A^H u| = s`, `|A v| = s` when only one side is computed).
*
* @private
* @param {string} jobu - left option
* @param {string} jobvt - right option
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Object} out - run under test
* @param {Object} opt - run at the optimal workspace
* @param {string} msg - label
*/
function checkAgainstOptimum( jobu, jobvt, M, N, out, opt, msg ) {
	const minmn = Math.min( M, N );
	const A = randomMatrix( M, N );
	const tol = 1e-12 * Math.max( M, N ) * opt.s[ 0 ];
	let sr;
	let si;
	let ur;
	let ui;
	let vr;
	let vi;
	let d;
	let i;
	let j;
	let k;
	for ( k = 0; k < minmn; k++ ) {
		assert.ok( Math.abs( out.s[ k ] - opt.s[ k ] ) <= tol, msg + ': s[' + k + '] ' + out.s[ k ] + ' vs ' + opt.s[ k ] );
		assert.ok( k === 0 || out.s[ k ] <= out.s[ k - 1 ], msg + ': s descending' );
	}
	if ( out.left ) {
		assertOrthonormal( true, M, minmn, out.left, M, 1e-12 * M, msg + ' U' );
		for ( k = 0; k < minmn; k++ ) {
			d = cdot( M, out.left, 1, k * M, opt.left, 1, k * M );
			assert.ok( Math.abs( Math.hypot( d[ 0 ], d[ 1 ] ) - 1.0 ) <= 1e-9, msg + ': u_' + k + ' vs optimum ' + d );
		}
	}
	if ( out.Ufull ) {
		assertOrthonormal( true, M, M, out.Ufull, M, 1e-12 * M, msg + ' full U' );
	}
	if ( out.right ) {
		assertOrthonormal( false, minmn, N, out.right, minmn, 1e-12 * N, msg + ' VT' );
		for ( k = 0; k < minmn; k++ ) {
			d = cdot( N, out.right, minmn, k, opt.right, minmn, k );
			assert.ok( Math.abs( Math.hypot( d[ 0 ], d[ 1 ] ) - 1.0 ) <= 1e-9, msg + ': v_' + k + ' vs optimum ' + d );
		}
	}
	if ( out.VTfull ) {
		assertOrthonormal( false, N, N, out.VTfull, N, 1e-12 * N, msg + ' full VT' );
	}
	if ( out.left && out.right ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				sr = 0.0;
				si = 0.0;
				for ( k = 0; k < minmn; k++ ) {
					ur = out.left[ 2 * ( i + ( k * M ) ) ] * out.s[ k ];
					ui = out.left[ ( 2 * ( i + ( k * M ) ) ) + 1 ] * out.s[ k ];
					vr = out.right[ 2 * ( k + ( j * minmn ) ) ];
					vi = out.right[ ( 2 * ( k + ( j * minmn ) ) ) + 1 ];
					sr += ( ur * vr ) - ( ui * vi );
					si += ( ur * vi ) + ( ui * vr );
				}
				assert.ok( Math.abs( sr - A[ 2 * ( i + ( j * M ) ) ] ) <= tol && Math.abs( si - A[ ( 2 * ( i + ( j * M ) ) ) + 1 ] ) <= tol, msg + ': A = U*S*VT at (' + i + ',' + j + ')' );
			}
		}
	} else if ( out.left ) {
		for ( k = 0; k < minmn; k++ ) {
			sr = 0.0;
			for ( j = 0; j < N; j++ ) {
				d = cdot( M, A, 1, j * M, out.left, 1, k * M );
				sr += ( d[ 0 ] * d[ 0 ] ) + ( d[ 1 ] * d[ 1 ] );
			}
			assert.ok( Math.abs( Math.sqrt( sr ) - out.s[ k ] ) <= tol, msg + ': |A^H u_' + k + '| = s' );
		}
	} else if ( out.right ) {
		for ( k = 0; k < minmn; k++ ) {
			sr = 0.0;
			for ( i = 0; i < M; i++ ) {
				// (A v)_i = sum_j A_ij conj( VT_kj )
				d = cdot( N, out.right, minmn, k, A, M, i );
				sr += ( d[ 0 ] * d[ 0 ] ) + ( d[ 1 ] * d[ 1 ] );
			}
			assert.ok( Math.abs( Math.sqrt( sr ) - out.s[ k ] ) <= tol, msg + ': |A v_' + k + '| = s' );
		}
	}
}

/**
* Returns the workspace lengths to sweep: the reference's minimum, the smallest fast-path sizes, a callee block size of 8, the optimum, and one large enough for LDA-by-N work matrices.
*
* @private
* @param {string} jobu - left option
* @param {string} jobvt - right option
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Array<PositiveInteger>} workspace lengths
*/
function sweep( jobu, jobvt, M, N ) {
	const minwrk = computeMinWorkSize( jobu, jobvt, M, N );
	const maxwrk = computeWorkSize( jobu, jobvt, M, N );
	const mn = Math.min( M, N );
	const mx = Math.max( M, N );
	const list = [
		minwrk,
		( mn * mn ) + ( 3 * mn ),
		( mn * mn ) + ( 3 * mn ) + ( ( M + N ) * 8 ),
		( 2 * mn * mn ) + ( 3 * mn ),
		( 2 * mn * mn ) + ( 3 * mn ) + ( mx * 8 ),
		( 2 * mn ) + ( ( M + N ) * 8 ),
		maxwrk,
		maxwrk + ( 2 * M * N )
	];
	return list.filter( function keep( v, i ) {
		return v >= minwrk && list.indexOf( v ) === i;
	}).sort( function cmp( a, b ) {
		return a - b;
	});
}

SHAPES.forEach( function each( shape ) {
	const M = shape[ 0 ];
	const N = shape[ 1 ];
	test( 'zgesvd: ' + M + 'x' + N + ', every job, WORK from the reference minimum (MINWRK) to past the optimum (MAXWRK) matches the optimum by property', function t() {
		let opt;
		JOBUS.forEach( function eachU( jobu ) {
			JOBVTS.forEach( function eachVT( jobvt ) {
				if ( jobu === 'overwrite' && jobvt === 'overwrite' ) {
					return;
				}
				opt = svdAt( jobu, jobvt, M, N, computeWorkSize( jobu, jobvt, M, N ) );
				sweep( jobu, jobvt, M, N ).forEach( function eachW( lwork ) {
					checkAgainstOptimum( jobu, jobvt, M, N, svdAt( jobu, jobvt, M, N, lwork ), opt, jobu + '/' + jobvt + ' lwork=' + lwork );
				});
			});
		});
	});
});

test( 'zgesvd: WORK one element below the reference minimum (MINWRK) throws', function t() {
	SHAPES.forEach( function each( shape ) {
		const M = shape[ 0 ];
		const N = shape[ 1 ];
		const minmn = Math.min( M, N );
		const minwrk = computeMinWorkSize( 'economy', 'economy', M, N );
		assert.strictEqual( minwrk, ( 2 * minmn ) + Math.max( M, N ) );
		assert.throws( function bad() {
			zgesvd( 'economy', 'economy', M, N, new Complex128Array( M * N ), 1, M, 0, new Float64Array( minmn ), 1, 0, new Complex128Array( M * M ), 1, M, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( minwrk + 1 ), 1, 2, new Float64Array( 5 * minmn ), 1, 0 );
		}, RangeError );
	});
	assert.strictEqual( computeMinWorkSize( 'none', 'all-rows', 70, 40 ), 120, 'path 1: 3N' );
	assert.strictEqual( computeMinWorkSize( 'all-columns', 'none', 40, 70 ), 120, 'path 1t: 3M' );
});

test( 'zgesvd: a missing WORK or RWORK throws a RangeError', function t() {
	const A = new Complex128Array( 4 );
	assert.throws( function bad() {
		zgesvd( 'none', 'none', 2, 2, A, 1, 2, 0, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, null, 1, 0, new Float64Array( 10 ), 1, 0 );
	}, RangeError );
	assert.throws( function bad() {
		zgesvd( 'none', 'none', 2, 2, A, 1, 2, 0, new Float64Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 10 ), 1, 0, null, 1, 0 );
	}, RangeError );
});
