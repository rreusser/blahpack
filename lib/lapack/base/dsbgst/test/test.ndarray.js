/* eslint-disable max-len, stdlib/first-unit-test, no-restricted-syntax, max-statements-per-line, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgst from './../lib/ndarray.js';


// FIXTURES //

import upperN5Ka2Kb1None from './fixtures/upper_n5_ka2_kb1_none.json' with { type: 'json' };
import lowerN5Ka2Kb1None from './fixtures/lower_n5_ka2_kb1_none.json' with { type: 'json' };
import upperN5Ka2Kb1Vect from './fixtures/upper_n5_ka2_kb1_vect.json' with { type: 'json' };
import lowerN5Ka2Kb1Vect from './fixtures/lower_n5_ka2_kb1_vect.json' with { type: 'json' };
import upperN4Ka1Kb1 from './fixtures/upper_n4_ka1_kb1.json' with { type: 'json' };
import upperN3Ka0Kb0 from './fixtures/upper_n3_ka0_kb0.json' with { type: 'json' };
import upperN8Ka3Kb2Vect from './fixtures/upper_n8_ka3_kb2_vect.json' with { type: 'json' };
import lowerN8Ka3Kb2Vect from './fixtures/lower_n8_ka3_kb2_vect.json' with { type: 'json' };

var fixtures = {
	'upper_n5_ka2_kb1_none': upperN5Ka2Kb1None,
	'lower_n5_ka2_kb1_none': lowerN5Ka2Kb1None,
	'upper_n5_ka2_kb1_vect': upperN5Ka2Kb1Vect,
	'lower_n5_ka2_kb1_vect': lowerN5Ka2Kb1Vect,
	'upper_n4_ka1_kb1': upperN4Ka1Kb1,
	'upper_n3_ka0_kb0': upperN3Ka0Kb0,
	'upper_n8_ka3_kb2_vect': upperN8Ka3Kb2Vect,
	'lower_n8_ka3_kb2_vect': lowerN8Ka3Kb2Vect
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

/**
* Runs a dsbgst test case from fixture data.
*
* @private
* @param {string} name - fixture case name
* @param {string} vect - 'none' or 'update'
* @param {string} uplo - 'upper' or 'lower'
* @param {integer} N - matrix order
* @param {integer} ka - half-bandwidth of A
* @param {integer} kb - half-bandwidth of B
* @param {integer} ldab - leading dimension of AB
* @param {integer} ldbb - leading dimension of BB
* @param {integer} ldx - leading dimension of X
* @param {number} tol - tolerance for comparison
*/
function runTest( name, vect, uplo, N, ka, kb, ldab, ldbb, ldx, tol ) {
	var WORK;
	var info;
	var tc;
	var AB;
	var BB;
	var Xm;

	tc = fixtures[ name ];

	AB = new Float64Array( tc.AB_in );
	BB = new Float64Array( tc.BB );
	Xm = new Float64Array( N * ldx );
	WORK = new Float64Array( 2 * N );

	info = dsbgst( vect, uplo, N, ka, kb, AB, 1, ldab, 0, BB, 1, ldbb, 0, Xm, 1, ldx, 0, WORK, 1, 0 ); // eslint-disable-line max-len

	assert.equal( info, tc.info, 'info' );

	assertArrayClose( AB, tc.AB, tol, 'AB' );

	if ( tc.X ) {
		assertArrayClose( Xm, tc.X, tol, 'X' );
	}
}


// TESTS //

test( 'dsbgst: main export is a function', function t() {
	assert.strictEqual( typeof dsbgst, 'function' );
});

test( 'dsbgst: upper_n5_ka2_kb1_none', function t() {
	runTest( 'upper_n5_ka2_kb1_none', 'none', 'upper', 5, 2, 1, 3, 2, 1, 1e-14 );
});

test( 'dsbgst: lower_n5_ka2_kb1_none', function t() {
	runTest( 'lower_n5_ka2_kb1_none', 'none', 'lower', 5, 2, 1, 3, 2, 1, 1e-14 );
});

test( 'dsbgst: upper_n5_ka2_kb1_vect', function t() {
	runTest( 'upper_n5_ka2_kb1_vect', 'update', 'upper', 5, 2, 1, 3, 2, 5, 1e-14 );
});

test( 'dsbgst: lower_n5_ka2_kb1_vect', function t() {
	runTest( 'lower_n5_ka2_kb1_vect', 'update', 'lower', 5, 2, 1, 3, 2, 5, 1e-14 );
});

test( 'dsbgst: n_zero quick return', function t() {
	var WORK;
	var info;
	var AB;
	var BB;
	var X;

	WORK = new Float64Array( 2 );
	AB = new Float64Array( 2 );
	BB = new Float64Array( 1 );
	X = new Float64Array( 1 );
	info = dsbgst( 'none', 'upper', 0, 1, 0, AB, 1, 2, 0, BB, 1, 1, 0, X, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dsbgst: upper_n4_ka1_kb1', function t() {
	runTest( 'upper_n4_ka1_kb1', 'none', 'upper', 4, 1, 1, 2, 2, 1, 1e-14 );
});

test( 'dsbgst: upper_n3_ka0_kb0 (diagonal)', function t() {
	runTest( 'upper_n3_ka0_kb0', 'none', 'upper', 3, 0, 0, 1, 1, 1, 1e-14 );
});

test( 'dsbgst: upper_n8_ka3_kb2_vect', function t() {
	runTest( 'upper_n8_ka3_kb2_vect', 'update', 'upper', 8, 3, 2, 4, 3, 8, 1e-12 );
});

test( 'dsbgst: lower_n8_ka3_kb2_vect', function t() {
	runTest( 'lower_n8_ka3_kb2_vect', 'update', 'lower', 8, 3, 2, 4, 3, 8, 1e-12 );
});
