/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbtrf from './../../dpbtrf/lib/base.js';
import dpbcon from './../lib/ndarray.js';

// FIXTURES //

import upper_kd1 from './fixtures/upper_kd1.json' with { type: 'json' };
import lower_kd1 from './fixtures/lower_kd1.json' with { type: 'json' };
import upper_kd2 from './fixtures/upper_kd2.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import anorm_zero from './fixtures/anorm_zero.json' with { type: 'json' };

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
* BandedMatrix.
*
* @private
* @param {*} ldab - ldab
* @param {*} n - n
* @param {*} entries - entries
* @returns {*} result
*/
function bandedMatrix( ldab, n, entries ) {
	var ab = new Float64Array( ldab * n );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		ab[ (entries[i][1] * ldab) + entries[i][0] ] = entries[i][2];
	}
	return ab;
}

// TESTS //

test( 'dpbcon: upper KD=1, N=4', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;
	var n;

	tc = upper_kd1;
	n = 4;
	ab = bandedMatrix( 2, n, [
		[1, 0, 4.0],
		[0, 1, 1.0],
		[1, 1, 5.0],
		[0, 2, 1.0],
		[1, 2, 6.0],
		[0, 3, 2.0],
		[1, 3, 7.0]
	]);
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', n, 1, ab, 1, 2, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', n, 1, ab, 1, 2, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: lower KD=1, N=4', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;
	var n;

	tc = lower_kd1;
	n = 4;
	ab = bandedMatrix( 2, n, [
		[0, 0, 4.0],
		[1, 0, 1.0],
		[0, 1, 5.0],
		[1, 1, 1.0],
		[0, 2, 6.0],
		[1, 2, 2.0],
		[0, 3, 7.0]
	]);
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	rcond = new Float64Array( 1 );
	info = dpbtrf( 'lower', n, 1, ab, 1, 2, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'lower', n, 1, ab, 1, 2, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: upper KD=2, N=4', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;
	var n;

	tc = upper_kd2;
	n = 4;
	ab = bandedMatrix( 3, n, [
		[2, 0, 10.0],
		[1, 1, 2.0],
		[2, 1, 10.0],
		[0, 2, 1.0],
		[1, 2, 3.0],
		[2, 2, 10.0],
		[0, 3, 1.0],
		[1, 3, 2.0],
		[2, 3, 10.0]
	]);
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', n, 2, ab, 1, 3, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', n, 2, ab, 1, 3, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: N=0', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;

	tc = n_zero;
	ab = new Float64Array( 1 );
	work = new Float64Array( 3 );
	iwork = new Int32Array( 1 );
	rcond = new Float64Array( 1 );
	info = dpbcon( 'upper', 0, 0, ab, 1, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});

test( 'dpbcon: N=1', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;

	tc = n_one;
	ab = new Float64Array([ 4.0 ]);
	work = new Float64Array( 3 );
	iwork = new Int32Array( 1 );
	rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', 1, 0, ab, 1, 1, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', 1, 0, ab, 1, 1, 0, 4.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});

test( 'dpbcon: anorm=0', function t() {
	var rcond;
	var iwork;
	var work;
	var info;
	var tc;
	var ab;
	var n;

	tc = anorm_zero;
	n = 4;
	ab = bandedMatrix( 2, n, [
		[1, 0, 4.0],
		[0, 1, 1.0],
		[1, 1, 5.0],
		[0, 2, 1.0],
		[1, 2, 6.0],
		[0, 3, 2.0],
		[1, 3, 7.0]
	]);
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	rcond = new Float64Array( 1 );
	dpbtrf( 'upper', n, 1, ab, 1, 2, 0 );
	info = dpbcon( 'upper', n, 1, ab, 1, 2, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});
