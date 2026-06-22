/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgehrd from '../../dgehrd/lib/base.js';
import dorghr from './../lib/ndarray.js';

// FIXTURES //

import _5x5_full from './fixtures/5x5_full.json' with { type: 'json' };
import _5x5_partial from './fixtures/5x5_partial.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import _4x4_full from './fixtures/4x4_full.json' with { type: 'json' };

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
* Extracts a column-major N-by-N submatrix from A into a flat array.
*/
function extractColMajor( A, strideA1, strideA2, offsetA, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] );
		}
	}
	return out;
}

/**
* Runs dgehrd then dorghr and returns the Q matrix as a flat column-major array.
*/
function runDorghr( N, ilo, ihi, Ainput ) {
	var WORK = new Float64Array( 1024 );
	var info;
	var TAU = new Float64Array( Math.max( 1, N ) );
	var A = new Float64Array( N * N );
	var i;

	// Copy input into A (column-major)
	for ( i = 0; i < Ainput.length; i++ ) {
		A[ i ] = Ainput[ i ];
	}

	// Run dgehrd: ilo and ihi are 1-based
	dgehrd( N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );

	// Run dorghr
	info = dorghr( N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0, 0 );

	return {
		'A': A,
		'info': info
	};
}

// TESTS //

test( 'dorghr: 5x5_full (ILO=1, IHI=5)', function t() {
	var Ainput;
	var result;
	var tc;
	var Q;

	tc = _5x5_full;
	Ainput = [
		2,
		1,
		3,
		1,
		2,
		1,
		4,
		2,
		3,
		1,
		3,
		2,
		5,
		2,
		3,
		1,
		3,
		2,
		4,
		1,
		2,
		1,
		3,
		1,
		5
	];
	result = runDorghr( 5, 1, 5, Ainput );
	Q = extractColMajor( result.A, 1, 5, 0, 5 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'dorghr: 5x5_partial (ILO=2, IHI=4)', function t() {
	var Ainput;
	var result;
	var tc;
	var Q;

	tc = _5x5_partial;
	Ainput = [
		2,
		1,
		3,
		1,
		2,
		1,
		4,
		2,
		3,
		1,
		3,
		2,
		5,
		2,
		3,
		1,
		3,
		2,
		4,
		1,
		2,
		1,
		3,
		1,
		5
	];
	result = runDorghr( 5, 2, 4, Ainput );
	Q = extractColMajor( result.A, 1, 5, 0, 5 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'dorghr: n_zero (N=0)', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	WORK = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	A = new Float64Array( 1 );
	info = dorghr( 0, 1, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorghr: n_one (N=1)', function t() {
	var Ainput;
	var result;
	var tc;
	var Q;

	tc = n_one;
	Ainput = [ 99.0 ];
	result = runDorghr( 1, 1, 1, Ainput );
	Q = extractColMajor( result.A, 1, 1, 0, 1 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'dorghr: ilo_eq_ihi (ILO=IHI=2, N=4)', function t() {
	var Ainput;
	var result;
	var tc;
	var Q;

	tc = ilo_eq_ihi;
	Ainput = [
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	];
	result = runDorghr( 4, 2, 2, Ainput );
	Q = extractColMajor( result.A, 1, 4, 0, 4 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'dorghr: 4x4_full (ILO=1, IHI=4)', function t() {
	var Ainput;
	var result;
	var tc;
	var Q;

	tc = _4x4_full;
	Ainput = [
		1,
		5,
		9,
		13,
		2,
		6,
		10,
		14,
		3,
		7,
		11,
		15,
		4,
		8,
		12,
		16
	];
	result = runDorghr( 4, 1, 4, Ainput );
	Q = extractColMajor( result.A, 1, 4, 0, 4 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'dorghr: orthogonality check for 5x5_full', function t() {
	var Ainput;
	var result;
	var dot;
	var N;
	var A;
	var i;
	var j;
	var k;

	Ainput = [
		2,
		1,
		3,
		1,
		2,
		1,
		4,
		2,
		3,
		1,
		3,
		2,
		5,
		2,
		3,
		1,
		3,
		2,
		4,
		1,
		2,
		1,
		3,
		1,
		5
	];
	result = runDorghr( 5, 1, 5, Ainput );
	N = 5;
	A = result.A;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dot = 0.0;
			for ( k = 0; k < N; k++ ) {
				dot += A[ k + i * N ] * A[ k + j * N ];
			}
			if ( i === j ) {
				assertClose( dot, 1.0, 1e-12, 'QtQ[' + i + ',' + j + ']' );
			} else {
				assertClose( dot, 0.0, 1e-12, 'QtQ[' + i + ',' + j + ']' );
			}
		}
	}
});
