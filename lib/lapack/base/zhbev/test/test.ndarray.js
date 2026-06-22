/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbev from './../lib/ndarray.js';

// FIXTURES //

import jobz_v_uplo_u_kd2_n5 from './fixtures/jobz_v_uplo_u_kd2_n5.json' with { type: 'json' };
import jobz_v_uplo_l_kd2_n5 from './fixtures/jobz_v_uplo_l_kd2_n5.json' with { type: 'json' };
import jobz_n_uplo_u_kd2_n5 from './fixtures/jobz_n_uplo_u_kd2_n5.json' with { type: 'json' };
import jobz_n_uplo_l_kd2_n5 from './fixtures/jobz_n_uplo_l_kd2_n5.json' with { type: 'json' };
import jobz_v_uplo_u_kd1_n4 from './fixtures/jobz_v_uplo_u_kd1_n4.json' with { type: 'json' };
import jobz_v_uplo_l_kd1_n4 from './fixtures/jobz_v_uplo_l_kd1_n4.json' with { type: 'json' };
import jobz_n_uplo_u_kd1_n4 from './fixtures/jobz_n_uplo_u_kd1_n4.json' with { type: 'json' };
import n1_jobz_v_lower from './fixtures/n1_jobz_v_lower.json' with { type: 'json' };
import n1_jobz_v_upper_kd2 from './fixtures/n1_jobz_v_upper_kd2.json' with { type: 'json' };
import n1_jobz_n from './fixtures/n1_jobz_n.json' with { type: 'json' };
import diagonal_jobz_v from './fixtures/diagonal_jobz_v.json' with { type: 'json' };
import diagonal_jobz_n from './fixtures/diagonal_jobz_n.json' with { type: 'json' };

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

// TESTS //

test( 'zhbev: jobz_v_uplo_u_kd2_n5', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = jobz_v_uplo_u_kd2_n5;
	AB = new Complex128Array( 3 * 5 );
	ABv = reinterpret( AB, 0 );
	ABv[ 4 ] = 4.0;
	ABv[ 8 ] = 1.0;
	ABv[ 9 ] = 1.0;
	ABv[ 10 ] = 5.0;
	ABv[ 12 ] = 2.0;
	ABv[ 13 ] = -1.0;
	ABv[ 14 ] = 3.0;
	ABv[ 15 ] = 1.0;
	ABv[ 16 ] = 6.0;
	ABv[ 18 ] = 1.0;
	ABv[ 19 ] = -1.0;
	ABv[ 20 ] = 2.0;
	ABv[ 21 ] = 1.0;
	ABv[ 22 ] = 7.0;
	ABv[ 24 ] = 1.0;
	ABv[ 25 ] = -1.0;
	ABv[ 26 ] = 3.0;
	ABv[ 27 ] = 1.0;
	ABv[ 28 ] = 8.0;
	w = new Float64Array( 5 );
	Z = new Complex128Array( 5 * 5 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 3 * 5 );
	info = zhbev( 'compute-vectors', 'upper', 5, 2, AB, 1, 3, 0, w, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.Z, 1e-13, 'Z' );
});

test( 'zhbev: jobz_v_uplo_l_kd2_n5', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = jobz_v_uplo_l_kd2_n5;
	AB = new Complex128Array( 3 * 5 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 4.0;
	ABv[ 1 ] = 0.0;
	ABv[ 2 ] = 1.0;
	ABv[ 3 ] = -1.0;
	ABv[ 4 ] = 2.0;
	ABv[ 5 ] = 1.0;
	ABv[ 6 ] = 5.0;
	ABv[ 7 ] = 0.0;
	ABv[ 8 ] = 3.0;
	ABv[ 9 ] = -1.0;
	ABv[ 10 ] = 1.0;
	ABv[ 11 ] = 1.0;
	ABv[ 12 ] = 6.0;
	ABv[ 13 ] = 0.0;
	ABv[ 14 ] = 2.0;
	ABv[ 15 ] = -1.0;
	ABv[ 16 ] = 1.0;
	ABv[ 17 ] = 1.0;
	ABv[ 18 ] = 7.0;
	ABv[ 19 ] = 0.0;
	ABv[ 20 ] = 3.0;
	ABv[ 21 ] = -1.0;
	ABv[ 24 ] = 8.0;
	ABv[ 25 ] = 0.0;
	w = new Float64Array( 5 );
	Z = new Complex128Array( 5 * 5 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 3 * 5 );
	info = zhbev( 'compute-vectors', 'lower', 5, 2, AB, 1, 3, 0, w, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.Z, 1e-13, 'Z' );
});

test( 'zhbev: jobz_n_uplo_u_kd2_n5', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var w;
	var Z;

	tc = jobz_n_uplo_u_kd2_n5;
	AB = new Complex128Array( 3 * 5 );
	ABv = reinterpret( AB, 0 );
	ABv[ 4 ] = 4.0;
	ABv[ 8 ] = 1.0;
	ABv[ 9 ] = 1.0;
	ABv[ 10 ] = 5.0;
	ABv[ 12 ] = 2.0;
	ABv[ 13 ] = -1.0;
	ABv[ 14 ] = 3.0;
	ABv[ 15 ] = 1.0;
	ABv[ 16 ] = 6.0;
	ABv[ 18 ] = 1.0;
	ABv[ 19 ] = -1.0;
	ABv[ 20 ] = 2.0;
	ABv[ 21 ] = 1.0;
	ABv[ 22 ] = 7.0;
	ABv[ 24 ] = 1.0;
	ABv[ 25 ] = -1.0;
	ABv[ 26 ] = 3.0;
	ABv[ 27 ] = 1.0;
	ABv[ 28 ] = 8.0;
	w = new Float64Array( 5 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 3 * 5 );
	info = zhbev( 'no-vectors', 'upper', 5, 2, AB, 1, 3, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
});

test( 'zhbev: jobz_n_uplo_l_kd2_n5', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var w;
	var Z;

	tc = jobz_n_uplo_l_kd2_n5;
	AB = new Complex128Array( 3 * 5 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 4.0;
	ABv[ 2 ] = 1.0;
	ABv[ 3 ] = -1.0;
	ABv[ 4 ] = 2.0;
	ABv[ 5 ] = 1.0;
	ABv[ 6 ] = 5.0;
	ABv[ 8 ] = 3.0;
	ABv[ 9 ] = -1.0;
	ABv[ 10 ] = 1.0;
	ABv[ 11 ] = 1.0;
	ABv[ 12 ] = 6.0;
	ABv[ 14 ] = 2.0;
	ABv[ 15 ] = -1.0;
	ABv[ 16 ] = 1.0;
	ABv[ 17 ] = 1.0;
	ABv[ 18 ] = 7.0;
	ABv[ 20 ] = 3.0;
	ABv[ 21 ] = -1.0;
	ABv[ 24 ] = 8.0;
	w = new Float64Array( 5 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 5 );
	RWORK = new Float64Array( 3 * 5 );
	info = zhbev( 'no-vectors', 'lower', 5, 2, AB, 1, 3, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
});

test( 'zhbev: jobz_v_uplo_u_kd1_n4', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = jobz_v_uplo_u_kd1_n4;
	AB = new Complex128Array( 2 * 4 );
	ABv = reinterpret( AB, 0 );
	ABv[ 2 ] = 4.0;
	ABv[ 4 ] = 1.0;
	ABv[ 5 ] = 1.0;
	ABv[ 6 ] = 5.0;
	ABv[ 8 ] = 2.0;
	ABv[ 9 ] = -1.0;
	ABv[ 10 ] = 6.0;
	ABv[ 12 ] = 3.0;
	ABv[ 13 ] = 1.0;
	ABv[ 14 ] = 7.0;
	w = new Float64Array( 4 );
	Z = new Complex128Array( 4 * 4 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 3 * 4 );
	info = zhbev( 'compute-vectors', 'upper', 4, 1, AB, 1, 2, 0, w, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.Z, 1e-13, 'Z' );
});

test( 'zhbev: jobz_v_uplo_l_kd1_n4', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = jobz_v_uplo_l_kd1_n4;
	AB = new Complex128Array( 2 * 4 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 4.0;
	ABv[ 2 ] = 1.0;
	ABv[ 3 ] = -1.0;
	ABv[ 4 ] = 5.0;
	ABv[ 6 ] = 2.0;
	ABv[ 7 ] = 1.0;
	ABv[ 8 ] = 6.0;
	ABv[ 10 ] = 3.0;
	ABv[ 11 ] = -1.0;
	ABv[ 12 ] = 7.0;
	w = new Float64Array( 4 );
	Z = new Complex128Array( 4 * 4 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 3 * 4 );
	info = zhbev( 'compute-vectors', 'lower', 4, 1, AB, 1, 2, 0, w, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.Z, 1e-13, 'Z' );
});

test( 'zhbev: jobz_n_uplo_u_kd1_n4', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var w;
	var Z;

	tc = jobz_n_uplo_u_kd1_n4;
	AB = new Complex128Array( 2 * 4 );
	ABv = reinterpret( AB, 0 );
	ABv[ 2 ] = 4.0;
	ABv[ 4 ] = 1.0;
	ABv[ 5 ] = 1.0;
	ABv[ 6 ] = 5.0;
	ABv[ 8 ] = 2.0;
	ABv[ 9 ] = -1.0;
	ABv[ 10 ] = 6.0;
	ABv[ 12 ] = 3.0;
	ABv[ 13 ] = 1.0;
	ABv[ 14 ] = 7.0;
	w = new Float64Array( 4 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 3 * 4 );
	info = zhbev( 'no-vectors', 'upper', 4, 1, AB, 1, 2, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
});

test( 'zhbev: n1_jobz_v_lower', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = n1_jobz_v_lower;
	AB = new Complex128Array( 1 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 3.5;
	ABv[ 1 ] = 0.0;
	w = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = zhbev( 'compute-vectors', 'lower', 1, 0, AB, 1, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.z11, 1e-14, 'z11' );
});

test( 'zhbev: n1_jobz_v_upper_kd2', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = n1_jobz_v_upper_kd2;
	AB = new Complex128Array( 3 );
	ABv = reinterpret( AB, 0 );
	ABv[ 4 ] = 7.25;
	ABv[ 5 ] = 0.0;
	w = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = zhbev( 'compute-vectors', 'upper', 1, 2, AB, 1, 3, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.z11, 1e-14, 'z11' );
});

test( 'zhbev: n1_jobz_n', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var w;
	var Z;

	tc = n1_jobz_n;
	AB = new Complex128Array( 1 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 9.0;
	w = new Float64Array( 1 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = zhbev( 'no-vectors', 'upper', 1, 0, AB, 1, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
});

test( 'zhbev: n0', function t() {
	var RWORK;
	var WORK;
	var info;
	var AB;
	var w;
	var Z;

	AB = new Complex128Array( 1 );
	w = new Float64Array( 0 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	RWORK = new Float64Array( 1 );
	info = zhbev( 'compute-vectors', 'upper', 0, 0, AB, 1, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zhbev: diagonal_jobz_v', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var Zv;
	var w;
	var Z;

	tc = diagonal_jobz_v;
	AB = new Complex128Array( 4 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 3.0;
	ABv[ 2 ] = 1.0;
	ABv[ 4 ] = 4.0;
	ABv[ 6 ] = 2.0;
	w = new Float64Array( 4 );
	Z = new Complex128Array( 4 * 4 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 3 * 4 );
	info = zhbev( 'compute-vectors', 'upper', 4, 0, AB, 1, 1, 0, w, 1, 0, Z, 1, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
	Zv = reinterpret( Z, 0 );
	assertArrayClose( Zv, tc.Z, 1e-13, 'Z' );
});

test( 'zhbev: diagonal_jobz_n', function t() {
	var RWORK;
	var WORK;
	var info;
	var ABv;
	var tc;
	var AB;
	var w;
	var Z;

	tc = diagonal_jobz_n;
	AB = new Complex128Array( 4 );
	ABv = reinterpret( AB, 0 );
	ABv[ 0 ] = 3.0;
	ABv[ 2 ] = 1.0;
	ABv[ 4 ] = 4.0;
	ABv[ 6 ] = 2.0;
	w = new Float64Array( 4 );
	Z = new Complex128Array( 1 );
	WORK = new Complex128Array( 4 );
	RWORK = new Float64Array( 3 * 4 );
	info = zhbev( 'no-vectors', 'lower', 4, 0, AB, 1, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( w, tc.w, 1e-13, 'w' );
});
