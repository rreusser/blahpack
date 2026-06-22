/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqgb from './../lib/ndarray.js';

// FIXTURES //

import no_equil from './fixtures/no_equil.json' with { type: 'json' };
import row_equil from './fixtures/row_equil.json' with { type: 'json' };
import col_equil from './fixtures/col_equil.json' with { type: 'json' };
import both_equil from './fixtures/both_equil.json' with { type: 'json' };
import amax_large from './fixtures/amax_large.json' with { type: 'json' };
import amax_small from './fixtures/amax_small.json' with { type: 'json' };

// FUNCTIONS //

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
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

// Test parameters: M=4, N=5, KL=1, KU=2, LDAB=4

/**
* Returns the input band matrix AB in column-major band storage.
*
* @private
* @returns {Float64Array} AB
*/
function inputAB() {
	// LDAB=4, N=5 => 20 elements (column-major)
	// Column 1: [0, 0, A(1,1)=2.0, A(2,1)=1.5]
	// Column 2: [0, A(1,2)=3.0, A(2,2)=1.0, A(3,2)=0.5]
	// Column 3: [A(1,3)=0.8, A(2,3)=2.5, A(3,3)=4.0, A(4,3)=1.2]
	// Column 4: [A(2,4)=0.6, A(3,4)=3.5, A(4,4)=2.0, 0]
	// Column 5: [A(3,5)=1.0, A(4,5)=0.7, 0, 0]
	return new Float64Array([
		0.0,
		0.0,
		2.0,
		1.5,
		0.0,
		3.0,
		1.0,
		0.5,
		0.8,
		2.5,
		4.0,
		1.2,
		0.6,
		3.5,
		2.0,
		0.0,
		1.0,
		0.7,
		0.0,
		0.0
	]);
}

/**
* Returns row scale factors.
*
* @private
* @returns {Float64Array} r
*/
function inputR( ) {
	return new Float64Array( [ 0.5, 1.0, 0.8, 0.25 ] );
}

/**
* Returns column scale factors.
*
* @private
* @returns {Float64Array} c
*/
function inputC( ) {
	return new Float64Array( [ 0.6, 1.0, 0.7, 0.9, 0.4 ] );
}

// TESTS //

test( 'dlaqgb: no equilibration (rowcnd >= thresh, colcnd >= thresh, amax in range)', function t() { // eslint-disable-line max-len
	var equed;
	var tc;
	var AB;

	tc = no_equil;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.5, 0.6, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'none' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: row equilibration only (rowcnd < thresh)', function t() {
	var equed;
	var tc;
	var AB;

	tc = row_equil;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.01, 0.6, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'row' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: column equilibration only (colcnd < thresh)', function t() {
	var equed;
	var tc;
	var AB;

	tc = col_equil;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.5, 0.01, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'column' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: both row and column equilibration', function t() {
	var equed;
	var tc;
	var AB;

	tc = both_equil;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.01, 0.01, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'both' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: row scaling triggered by amax > large', function t() {
	var equed;
	var tc;
	var AB;

	tc = amax_large;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.5, 0.6, 1.0e300 ); // eslint-disable-line max-len
	assert.equal( equed, 'row' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: row scaling triggered by amax < small', function t() {
	var equed;
	var tc;
	var AB;

	tc = amax_small;
	AB = inputAB();
	equed = dlaqgb( 4, 5, 1, 2, AB, 1, 4, 0, inputR(), 1, 0, inputC(), 1, 0, 0.5, 0.6, 1.0e-320 ); // eslint-disable-line max-len
	assert.equal( equed, 'row' );
	assertArrayClose( AB, tc.ab, 1e-14, 'ab' );
});

test( 'dlaqgb: quick return M=0', function t() {
	var equed = dlaqgb( 0, 5, 1, 2, new Float64Array( 0 ), 1, 4, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 5 ), 1, 0, 0.5, 0.6, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'none' );
});

test( 'dlaqgb: quick return N=0', function t() {
	var equed = dlaqgb( 4, 0, 1, 2, new Float64Array( 0 ), 1, 4, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 0 ), 1, 0, 0.5, 0.6, 4.0 ); // eslint-disable-line max-len
	assert.equal( equed, 'none' );
});
