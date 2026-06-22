/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasd5 from './../lib/ndarray.js';


// FIXTURES //

import i1WPositive from './fixtures/i1_w_positive.json' with { type: 'json' };
import i1WNonpositive from './fixtures/i1_w_nonpositive.json' with { type: 'json' };
import i2BPositive from './fixtures/i2_b_positive.json' with { type: 'json' };
import i2BNonpositive from './fixtures/i2_b_nonpositive.json' with { type: 'json' };
import i1WNonposBNonpos from './fixtures/i1_w_nonpos_b_nonpos.json' with { type: 'json' };
import d1ZeroI1 from './fixtures/d1_zero_i1.json' with { type: 'json' };
import d1ZeroI2 from './fixtures/d1_zero_i2.json' with { type: 'json' };
import largeRhoI1 from './fixtures/large_rho_i1.json' with { type: 'json' };
import largeRhoI2 from './fixtures/large_rho_i2.json' with { type: 'json' };

var fixtures = {
	'i1_w_positive': i1WPositive,
	'i1_w_nonpositive': i1WNonpositive,
	'i2_b_positive': i2BPositive,
	'i2_b_nonpositive': i2BNonpositive,
	'i1_w_nonpos_b_nonpos': i1WNonposBNonpos,
	'd1_zero_i1': d1ZeroI1,
	'd1_zero_i2': d1ZeroI2,
	'large_rho_i1': largeRhoI1,
	'large_rho_i2': largeRhoI2
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

/**
* Runs dlasd5 with fixture data and compares outputs.
*
* @private
* @param {string} name - test case name from fixture
* @param {integer} i - eigenvalue index (1 or 2)
*/
function runTest( name, i ) {
	var dsigma;
	var delta;
	var work;
	var tc;
	var d;
	var z;

	tc = fixtures[ name ];
	d = new Float64Array( tc.D );
	z = new Float64Array( tc.Z );
	delta = new Float64Array( 2 );
	dsigma = new Float64Array( 1 );
	work = new Float64Array( 2 );

	dlasd5( i, d, 1, 0, z, 1, 0, delta, 1, 0, tc.rho, dsigma, work, 1, 0 );

	assertClose( dsigma[ 0 ], tc.dsigma, 1e-14, 'dsigma' );
	assertArrayClose( delta, tc.delta, 1e-14, 'delta' );
	assertArrayClose( work, tc.work, 1e-14, 'work' );
}


// TESTS //

test( 'dlasd5 is a function', function t() {
	assert.equal( typeof dlasd5, 'function' );
});

test( 'dlasd5: I=1, W>0 branch (basic case)', function t() {
	runTest( 'i1_w_positive', 1 );
});

test( 'dlasd5: I=1, W<=0, B>0 branch', function t() {
	runTest( 'i1_w_nonpositive', 1 );
});

test( 'dlasd5: I=2, B>0 branch', function t() {
	runTest( 'i2_b_positive', 2 );
});

test( 'dlasd5: I=2, B<=0 branch', function t() {
	runTest( 'i2_b_nonpositive', 2 );
});

test( 'dlasd5: I=1, W<=0, B<=0 branch', function t() {
	runTest( 'i1_w_nonpos_b_nonpos', 1 );
});

test( 'dlasd5: D(1)=0 edge case, I=1', function t() {
	runTest( 'd1_zero_i1', 1 );
});

test( 'dlasd5: D(1)=0 edge case, I=2', function t() {
	runTest( 'd1_zero_i2', 2 );
});

test( 'dlasd5: large rho, I=1', function t() {
	runTest( 'large_rho_i1', 1 );
});

test( 'dlasd5: large rho, I=2', function t() {
	runTest( 'large_rho_i2', 2 );
});

test( 'dlasd5: supports non-unit strides', function t() {
	var dsigma;
	var delta;
	var work;
	var tc;
	var d;
	var z;

	tc = i1WPositive;
	d = new Float64Array( [ tc.D[ 0 ], 0.0, tc.D[ 1 ] ] );
	z = new Float64Array( [ tc.Z[ 0 ], 0.0, tc.Z[ 1 ] ] );
	delta = new Float64Array( 3 );
	dsigma = new Float64Array( 1 );
	work = new Float64Array( 3 );
	dlasd5( 1, d, 2, 0, z, 2, 0, delta, 2, 0, tc.rho, dsigma, work, 2, 0 );
	assertClose( dsigma[ 0 ], tc.dsigma, 1e-14, 'dsigma' );
	assertClose( delta[ 0 ], tc.delta[ 0 ], 1e-14, 'delta[0]' );
	assertClose( delta[ 2 ], tc.delta[ 1 ], 1e-14, 'delta[1]' );
	assertClose( work[ 0 ], tc.work[ 0 ], 1e-14, 'work[0]' );
	assertClose( work[ 2 ], tc.work[ 1 ], 1e-14, 'work[1]' );
});

test( 'dlasd5: supports offset parameters', function t() {
	var dsigma;
	var delta;
	var work;
	var tc;
	var d;
	var z;

	tc = i2BPositive;
	d = new Float64Array( [ 0.0, tc.D[ 0 ], tc.D[ 1 ] ] );
	z = new Float64Array( [ 0.0, tc.Z[ 0 ], tc.Z[ 1 ] ] );
	delta = new Float64Array( 4 );
	dsigma = new Float64Array( 1 );
	work = new Float64Array( 4 );
	dlasd5( 2, d, 1, 1, z, 1, 1, delta, 1, 2, tc.rho, dsigma, work, 1, 2 );
	assertClose( dsigma[ 0 ], tc.dsigma, 1e-14, 'dsigma' );
	assertClose( delta[ 2 ], tc.delta[ 0 ], 1e-14, 'delta[0]' );
	assertClose( delta[ 3 ], tc.delta[ 1 ], 1e-14, 'delta[1]' );
	assertClose( work[ 2 ], tc.work[ 0 ], 1e-14, 'work[0]' );
	assertClose( work[ 3 ], tc.work[ 1 ], 1e-14, 'work[1]' );
});
