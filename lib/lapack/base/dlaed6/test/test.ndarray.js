/* eslint-disable max-len, no-restricted-syntax, max-statements-per-line, require-jsdoc, stdlib/jsdoc-private-annotation, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed6 from './../lib/index.js';


// FIXTURES //

import orgati_true_kniter1_finit_pos from './fixtures/orgati_true_kniter1_finit_pos.json' with { type: 'json' };
import orgati_false_kniter1_finit_neg from './fixtures/orgati_false_kniter1_finit_neg.json' with { type: 'json' };
import orgati_true_kniter2 from './fixtures/orgati_true_kniter2.json' with { type: 'json' };
import orgati_false_kniter2 from './fixtures/orgati_false_kniter2.json' with { type: 'json' };
import orgati_true_finit_neg from './fixtures/orgati_true_finit_neg.json' with { type: 'json' };
import orgati_false_finit_pos from './fixtures/orgati_false_finit_pos.json' with { type: 'json' };
import orgati_true_kniter2_finit_neg from './fixtures/orgati_true_kniter2_finit_neg.json' with { type: 'json' };
import small_values_scaling from './fixtures/small_values_scaling.json' with { type: 'json' };
import orgati_false_kniter2_alternate from './fixtures/orgati_false_kniter2_alternate.json' with { type: 'json' };
import close_d_values from './fixtures/close_d_values.json' with { type: 'json' };
import large_rho_kniter2 from './fixtures/large_rho_kniter2.json' with { type: 'json' };
import neg_rho_orgati_false_kniter2 from './fixtures/neg_rho_orgati_false_kniter2.json' with { type: 'json' };
import very_small_scaling2 from './fixtures/very_small_scaling2.json' with { type: 'json' };
import orgati_false_small_values from './fixtures/orgati_false_small_values.json' with { type: 'json' };
import kniter2_orgati_large_rho from './fixtures/kniter2_orgati_large_rho.json' with { type: 'json' };
import kniter2_orgati_false_neg_finit from './fixtures/kniter2_orgati_false_neg_finit.json' with { type: 'json' };

var fixtures = {
	'orgati_true_kniter1_finit_pos': orgati_true_kniter1_finit_pos,
	'orgati_false_kniter1_finit_neg': orgati_false_kniter1_finit_neg,
	'orgati_true_kniter2': orgati_true_kniter2,
	'orgati_false_kniter2': orgati_false_kniter2,
	'orgati_true_finit_neg': orgati_true_finit_neg,
	'orgati_false_finit_pos': orgati_false_finit_pos,
	'orgati_true_kniter2_finit_neg': orgati_true_kniter2_finit_neg,
	'small_values_scaling': small_values_scaling,
	'orgati_false_kniter2_alternate': orgati_false_kniter2_alternate,
	'close_d_values': close_d_values,
	'large_rho_kniter2': large_rho_kniter2,
	'neg_rho_orgati_false_kniter2': neg_rho_orgati_false_kniter2,
	'very_small_scaling2': very_small_scaling2,
	'orgati_false_small_values': orgati_false_small_values,
	'kniter2_orgati_large_rho': kniter2_orgati_large_rho,
	'kniter2_orgati_false_neg_finit': kniter2_orgati_false_neg_finit
};


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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

/**
* RunTest.
*
* @private
* @param {string} name - test case name
* @param {*} kniter - kniter
* @param {*} orgati - orgati
*/
function runTest( name, kniter, orgati ) {
	var info;
	var tau;
	var tc;
	var d;
	var z;

	tc = fixtures[ name ];
	d = new Float64Array( tc.D );
	z = new Float64Array( tc.Z );
	tau = new Float64Array( 1 );
	info = dlaed6.ndarray( kniter, orgati, tc.RHO, d, 1, 0, z, 1, 0, tc.FINIT, tau ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO, name + ': info mismatch' );
	assertClose( tau[ 0 ], tc.TAU, 1e-12, name + ': tau' );
}


// TESTS //

test( 'dlaed6: main export is a function', function t() {
	assert.strictEqual( typeof dlaed6, 'function' );
});

test( 'dlaed6: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlaed6.ndarray, 'function' );
});

test( 'dlaed6: orgati=true, kniter=1, finit > 0', function t() {
	runTest( 'orgati_true_kniter1_finit_pos', 1, true );
});

test( 'dlaed6: orgati=false, kniter=1, finit < 0', function t() {
	runTest( 'orgati_false_kniter1_finit_neg', 1, false );
});

test( 'dlaed6: orgati=true, kniter=2', function t() {
	runTest( 'orgati_true_kniter2', 2, true );
});

test( 'dlaed6: orgati=false, kniter=2', function t() {
	runTest( 'orgati_false_kniter2', 2, false );
});

test( 'dlaed6: orgati=true, finit < 0', function t() {
	runTest( 'orgati_true_finit_neg', 1, true );
});

test( 'dlaed6: orgati=false, finit > 0', function t() {
	runTest( 'orgati_false_finit_pos', 1, false );
});

test( 'dlaed6: orgati=true, kniter=2, finit < 0', function t() {
	runTest( 'orgati_true_kniter2_finit_neg', 2, true );
});

test( 'dlaed6: small values trigger SMALL1 scaling', function t() {
	runTest( 'small_values_scaling', 1, true );
});

test( 'dlaed6: orgati=false, kniter=2, alternate config', function t() {
	runTest( 'orgati_false_kniter2_alternate', 2, false );
});

test( 'dlaed6: close D values (nearly degenerate)', function t() {
	runTest( 'close_d_values', 1, true );
});

test( 'dlaed6: large rho, kniter=2', function t() {
	runTest( 'large_rho_kniter2', 2, true );
});

test( 'dlaed6: negative rho, orgati=false, kniter=2', function t() {
	runTest( 'neg_rho_orgati_false_kniter2', 2, false );
});

test( 'dlaed6: very small values trigger SMALL2 scaling', function t() {
	runTest( 'very_small_scaling2', 1, true );
});

test( 'dlaed6: orgati=false, small values scaling', function t() {
	runTest( 'orgati_false_small_values', 1, false );
});

test( 'dlaed6: kniter=2, orgati=true, large rho', function t() {
	runTest( 'kniter2_orgati_large_rho', 2, true );
});

test( 'dlaed6: kniter=2, orgati=false, negative finit', function t() {
	runTest( 'kniter2_orgati_false_neg_finit', 2, false );
});

test( 'dlaed6: supports non-unit strides', function t() {
	var info;
	var tau;
	var tc;
	var d;
	var z;

	tc = orgati_true_kniter2;
	d = new Float64Array( [ tc.D[0], 999.0, tc.D[1], 999.0, tc.D[2] ] );
	z = new Float64Array( [ tc.Z[0], 888.0, tc.Z[1], 888.0, tc.Z[2] ] );
	tau = new Float64Array( 1 );
	info = dlaed6.ndarray( 2, true, tc.RHO, d, 2, 0, z, 2, 0, tc.FINIT, tau );
	assert.equal( info, tc.INFO, 'info mismatch' );
	assertClose( tau[ 0 ], tc.TAU, 1e-12, 'tau with stride=2' );
});

test( 'dlaed6: supports offsets', function t() {
	var info;
	var tau;
	var tc;
	var d;
	var z;

	tc = orgati_false_kniter2;
	d = new Float64Array( [ 999.0, 999.0, tc.D[0], tc.D[1], tc.D[2] ] );
	z = new Float64Array( [ 888.0, 888.0, tc.Z[0], tc.Z[1], tc.Z[2] ] );
	tau = new Float64Array( 1 );
	info = dlaed6.ndarray( 2, false, tc.RHO, d, 1, 2, z, 1, 2, tc.FINIT, tau );
	assert.equal( info, tc.INFO, 'info mismatch' );
	assertClose( tau[ 0 ], tc.TAU, 1e-12, 'tau with offset=2' );
});

test( 'dlaed6: BLAS-style API wrapper works', function t() {
	var info;
	var tau;
	var tc;
	var d;
	var z;

	tc = orgati_true_kniter2;
	d = new Float64Array( tc.D );
	z = new Float64Array( tc.Z );
	tau = new Float64Array( 1 );
	info = dlaed6( 2, true, tc.RHO, d, z, tc.FINIT, tau );
	assert.equal( info, tc.INFO, 'info mismatch' );
	assertClose( tau[ 0 ], tc.TAU, 1e-12, 'tau from BLAS-style API' );
});
