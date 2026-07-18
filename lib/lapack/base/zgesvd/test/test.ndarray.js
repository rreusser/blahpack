/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgesvd from './../lib/ndarray.js';

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

test( 'zgesvd: undersized WORK throws a RangeError', function t() {
	let RWORK, WORK, VT, s, U, A;

	RWORK = new Float64Array( 50 );
	WORK = new Complex128Array( 1 );
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
