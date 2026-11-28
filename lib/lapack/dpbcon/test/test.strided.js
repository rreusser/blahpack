/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbtrf from './../../dpbtrf/lib/base.js';
import dpbcon from './../lib/strided.js';

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	const ab = new Float64Array( ldab * n );
	let i;
	for ( i = 0; i < entries.length; i++ ) {
		ab[ (entries[i][1] * ldab) + entries[i][0] ] = entries[i][2];
	}
	return ab;
}

// TESTS //

test( 'dpbcon: upper KD=1, N=4', function t() {
	let info;

	const tc = upper_kd1;
	const n = 4;
	const ab = bandedMatrix( 2, n, [
		[1, 0, 4.0],
		[0, 1, 1.0],
		[1, 1, 5.0],
		[0, 2, 1.0],
		[1, 2, 6.0],
		[0, 3, 2.0],
		[1, 3, 7.0]
	]);
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	const rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', n, 1, ab, 1, 2, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', n, 1, ab, 1, 2, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: lower KD=1, N=4', function t() {
	let info;

	const tc = lower_kd1;
	const n = 4;
	const ab = bandedMatrix( 2, n, [
		[0, 0, 4.0],
		[1, 0, 1.0],
		[0, 1, 5.0],
		[1, 1, 1.0],
		[0, 2, 6.0],
		[1, 2, 2.0],
		[0, 3, 7.0]
	]);
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	const rcond = new Float64Array( 1 );
	info = dpbtrf( 'lower', n, 1, ab, 1, 2, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'lower', n, 1, ab, 1, 2, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: upper KD=2, N=4', function t() {
	let info;

	const tc = upper_kd2;
	const n = 4;
	const ab = bandedMatrix( 3, n, [
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
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	const rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', n, 2, ab, 1, 3, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', n, 2, ab, 1, 3, 0, tc.anorm, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-10, 'rcond' );
});

test( 'dpbcon: N=0', function t() {

	const tc = n_zero;
	const ab = new Float64Array( 1 );
	const work = new Float64Array( 3 );
	const iwork = new Int32Array( 1 );
	const rcond = new Float64Array( 1 );
	const info = dpbcon( 'upper', 0, 0, ab, 1, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});

test( 'dpbcon: N=1', function t() {
	let info;

	const tc = n_one;
	const ab = new Float64Array([ 4.0 ]);
	const work = new Float64Array( 3 );
	const iwork = new Int32Array( 1 );
	const rcond = new Float64Array( 1 );
	info = dpbtrf( 'upper', 1, 0, ab, 1, 1, 0 );
	assert.equal( info, 0, 'dpbtrf info' );
	info = dpbcon( 'upper', 1, 0, ab, 1, 1, 0, 4.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});

test( 'dpbcon: anorm=0', function t() {

	const tc = anorm_zero;
	const n = 4;
	const ab = bandedMatrix( 2, n, [
		[1, 0, 4.0],
		[0, 1, 1.0],
		[1, 1, 5.0],
		[0, 2, 1.0],
		[1, 2, 6.0],
		[0, 3, 2.0],
		[1, 3, 7.0]
	]);
	const work = new Float64Array( 3 * n );
	const iwork = new Int32Array( n );
	const rcond = new Float64Array( 1 );
	dpbtrf( 'upper', n, 1, ab, 1, 2, 0 );
	const info = dpbcon( 'upper', n, 1, ab, 1, 2, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( rcond[0], tc.rcond, 1e-14, 'rcond' );
});

// Regression: when the scaled solve inside the DLACN2 loop would overflow,
// the reference leaves the loop with GO TO 20, skipping the RCOND
// computation, so RCOND stays exactly 0. The second solve here grows to
// ~1/a^2 > 1/SMLNUM while EST is already ~3.5e307; the old `break` fell
// into `rcond = 1/ainvnm/anorm` and returned ~2.88e-308.
test( 'dpbcon: an overflowing scaled solve leaves rcond exactly 0 (reference GO TO 20)', function t() {
	const a = 1.2e-154;
	[ 'upper', 'lower' ].forEach( function each( uplo ) {
		const rcond = new Float64Array( 1 );
		const info = dpbcon( uplo, 2, 0, new Float64Array( [ 1.0, a ] ), 1, 1, 0, 1.0, rcond, new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
		assert.equal( info, 0, uplo + ': info' );
		assert.ok( Object.is( rcond[ 0 ], 0.0 ), uplo + ': rcond is exactly 0, got ' + rcond[ 0 ] );
	});
});

test( 'strided: inv(A) underflowing to zero leaves rcond = 0 (AINVNM = 0 guard)', function t() {
	// N = 1, factor 1e200: the two triangular solves give 1/1e200/1e200, which
	// underflows to 0 with scale = 1, so the estimator returns AINVNM = 0. The
	// reference then skips RCOND = (1/AINVNM)/ANORM and returns RCOND = 0, INFO = 0.
	[ 'upper', 'lower' ].forEach( function check( uplo ) {
		const rcond = new Float64Array( [ -1.0 ] );
		const A = new Float64Array( [ 1e200 ] );
		const info = dpbcon( uplo, 1, 0, A, 1, 1, 0, 1.0, rcond, new Float64Array( 3 ), 1, 0, new Int32Array( 1 ), 1, 0 ); // eslint-disable-line max-len
		assert.strictEqual( info, 0, uplo + ': info' );
		assert.ok( Object.is( rcond[ 0 ], 0.0 ), uplo + ': rcond is exactly 0, got ' + rcond[ 0 ] );
	});
});
