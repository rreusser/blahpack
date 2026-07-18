/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbstf from './../lib/ndarray.js';

// FIXTURES //

import upper_tridiag_5 from './fixtures/upper_tridiag_5.json' with { type: 'json' };
import lower_tridiag_5 from './fixtures/lower_tridiag_5.json' with { type: 'json' };
import upper_penta_4 from './fixtures/upper_penta_4.json' with { type: 'json' };
import lower_penta_4 from './fixtures/lower_penta_4.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import upper_7x7_kd2 from './fixtures/upper_7x7_kd2.json' with { type: 'json' };
import lower_7x7_kd2 from './fixtures/lower_7x7_kd2.json' with { type: 'json' };
import upper_full_3 from './fixtures/upper_full_3.json' with { type: 'json' };

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

// TESTS //

test( 'dpbstf: upper_tridiag_5', function t() {

	const tc = upper_tridiag_5;
	const ab = new Float64Array([
		0.0,
		2.0,   // col 0
		-1.0,
		2.0,   // col 1
		-1.0,
		2.0,   // col 2
		-1.0,
		2.0,   // col 3
		-1.0,
		2.0    // col 4
	]);
	const info = dpbstf( 'upper', 5, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: lower_tridiag_5', function t() {

	const tc = lower_tridiag_5;
	const ab = new Float64Array([
		2.0,
		-1.0,  // col 0
		2.0,
		-1.0,  // col 1
		2.0,
		-1.0,  // col 2
		2.0,
		-1.0,  // col 3
		2.0,
		0.0   // col 4
	]);
	const info = dpbstf( 'lower', 5, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: upper_penta_4', function t() {

	const tc = upper_penta_4;
	const ab = new Float64Array([
		0.0,
		0.0,
		4.0,   // col 0
		0.0,
		-1.0,
		4.0,   // col 1
		0.5,
		-1.0,
		4.0,   // col 2
		0.5,
		-1.0,
		4.0    // col 3
	]);
	const info = dpbstf( 'upper', 4, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: lower_penta_4', function t() {

	const tc = lower_penta_4;
	const ab = new Float64Array([
		4.0,
		-1.0,
		0.5,   // col 0
		4.0,
		-1.0,
		0.5,   // col 1
		4.0,
		-1.0,
		0.0,   // col 2
		4.0,
		0.0,
		0.0    // col 3
	]);
	const info = dpbstf( 'lower', 4, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: n_one', function t() {

	const tc = n_one;
	const ab = new Float64Array([ 9.0 ]);
	const info = dpbstf( 'upper', 1, 0, ab, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: n_zero', function t() {

	const tc = n_zero;
	const info = dpbstf( 'lower', 0, 0, new Float64Array([ 99.0 ]), 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dpbstf: not_posdef', function t() {

	const tc = not_posdef;
	const ab = new Float64Array([
		1.0,
		2.0,   // col 0
		1.0,
		0.0    // col 1
	]);
	const info = dpbstf( 'lower', 2, 1, ab, 1, 2, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: upper_7x7_kd2', function t() {

	const tc = upper_7x7_kd2;
	const ab = new Float64Array([
		0.0,
		0.0,
		10.0,       // col 0
		0.0,
		-1.0,
		10.0,      // col 1
		0.5,
		-1.0,
		10.0,      // col 2
		0.5,
		-1.0,
		10.0,      // col 3
		0.5,
		-1.0,
		10.0,      // col 4
		0.5,
		-1.0,
		10.0,      // col 5
		0.5,
		-1.0,
		10.0       // col 6
	]);
	const info = dpbstf( 'upper', 7, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: lower_7x7_kd2', function t() {

	const tc = lower_7x7_kd2;
	const ab = new Float64Array([
		10.0,
		-1.0,
		0.5,      // col 0
		10.0,
		-1.0,
		0.5,      // col 1
		10.0,
		-1.0,
		0.5,      // col 2
		10.0,
		-1.0,
		0.5,      // col 3
		10.0,
		-1.0,
		0.5,      // col 4
		10.0,
		-1.0,
		0.0,      // col 5
		10.0,
		0.0,
		0.0        // col 6
	]);
	const info = dpbstf( 'lower', 7, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: upper_full_3', function t() {

	const tc = upper_full_3;
	const ab = new Float64Array([
		0.0,
		0.0,
		4.0,   // col 0
		0.0,
		2.0,
		5.0,   // col 1
		1.0,
		3.0,
		6.0    // col 2
	]);
	const info = dpbstf( 'upper', 3, 2, ab, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( ab, tc.ab, 1e-14, 'ab' );
});

test( 'dpbstf: not_posdef upper', function t() {

	const ab = new Float64Array([
		0.0,
		1.0,   // col 0: diag=1
		2.0,
		1.0    // col 1: superdiag=2, diag=1
	]);
	const info = dpbstf( 'upper', 2, 1, ab, 1, 2, 0 );
	assert.ok( info > 0 );
});
