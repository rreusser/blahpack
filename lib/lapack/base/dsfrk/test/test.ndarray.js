/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, node/no-sync, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsfrk from './../lib/index.js';
import base from './../lib/ndarray.js';


// FIXTURES //

import oddNLN from './fixtures/odd_nln.json' with { type: 'json' };
import oddNLT from './fixtures/odd_nlt.json' with { type: 'json' };
import oddNUN from './fixtures/odd_nun.json' with { type: 'json' };
import oddNUT from './fixtures/odd_nut.json' with { type: 'json' };
import oddTLN from './fixtures/odd_tln.json' with { type: 'json' };
import oddTLT from './fixtures/odd_tlt.json' with { type: 'json' };
import oddTUN from './fixtures/odd_tun.json' with { type: 'json' };
import oddTUT from './fixtures/odd_tut.json' with { type: 'json' };
import evenNLN from './fixtures/even_nln.json' with { type: 'json' };
import evenNLT from './fixtures/even_nlt.json' with { type: 'json' };
import evenNUN from './fixtures/even_nun.json' with { type: 'json' };
import evenNUT from './fixtures/even_nut.json' with { type: 'json' };
import evenTLN from './fixtures/even_tln.json' with { type: 'json' };
import evenTLT from './fixtures/even_tlt.json' with { type: 'json' };
import evenTUN from './fixtures/even_tun.json' with { type: 'json' };
import evenTUT from './fixtures/even_tut.json' with { type: 'json' };
import odd5NLN from './fixtures/odd5_nln.json' with { type: 'json' };
import odd5TUT from './fixtures/odd5_tut.json' with { type: 'json' };
import nZero from './fixtures/n_zero.json' with { type: 'json' };
import alphaZeroBetaOne from './fixtures/alpha_zero_beta_one.json' with { type: 'json' };
import alphaZeroBetaZero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import kZeroBetaOne from './fixtures/k_zero_beta_one.json' with { type: 'json' };

var fixtures = {
	'odd_NLN': oddNLN,
	'odd_NLT': oddNLT,
	'odd_NUN': oddNUN,
	'odd_NUT': oddNUT,
	'odd_TLN': oddTLN,
	'odd_TLT': oddTLT,
	'odd_TUN': oddTUN,
	'odd_TUT': oddTUT,
	'even_NLN': evenNLN,
	'even_NLT': evenNLT,
	'even_NUN': evenNUN,
	'even_NUT': evenNUT,
	'even_TLN': evenTLN,
	'even_TLT': evenTLT,
	'even_TUN': evenTUN,
	'even_TUT': evenTUT,
	'odd5_NLN': odd5NLN,
	'odd5_TUT': odd5TUT
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise approximately equal.
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
* Decode fixture name to get dsfrk parameters.
*
* @private
* @param {string} name - fixture name like 'odd_NLN'
* @returns {Object} object with transr, uplo, trans strings
*/
function decodeParams( name ) {
	var transr;
	var parts;
	var trans;
	var uplo;
	var code;

	parts = name.split( '_' );
	code = parts[ parts.length - 1 ];
	transr = ( code[ 0 ] === 'N' ) ? 'no-transpose' : 'transpose';
	uplo = ( code[ 1 ] === 'L' ) ? 'lower' : 'upper';
	trans = ( code[ 2 ] === 'N' ) ? 'no-transpose' : 'transpose';
	return {
		'transr': transr,
		'uplo': uplo,
		'trans': trans
	};
}

/**
* Run a standard dsfrk fixture test.
*
* @private
* @param {string} name - fixture name
*/
function runCase( name ) {
	var params;
	var nrowa;
	var tc;
	var cA;
	var cC;
	var N;
	var K;

	tc = fixtures[ name ];
	params = decodeParams( name );
	N = tc.n;
	K = tc.k;

	if ( params.trans === 'no-transpose' ) {
		nrowa = N;
	} else {
		nrowa = K;
	}

	cA = new Float64Array( tc.A );
	cC = new Float64Array( tc.c_in );

	base( params.transr, params.uplo, params.trans, N, K, tc.alpha, cA, 1, nrowa, 0, tc.beta, cC, 1, 0 );

	assertArrayClose( cC, tc.c_out, 1e-14, name );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsfrk, 'function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dsfrk.ndarray, 'function' );
});

// N=3 (odd), all 8 transr/uplo/trans combinations

test( 'dsfrk: odd, N, L, N', function t() {
	runCase( 'odd_NLN' );
});

test( 'dsfrk: odd, N, L, T', function t() {
	runCase( 'odd_NLT' );
});

test( 'dsfrk: odd, N, U, N', function t() {
	runCase( 'odd_NUN' );
});

test( 'dsfrk: odd, N, U, T', function t() {
	runCase( 'odd_NUT' );
});

test( 'dsfrk: odd, T, L, N', function t() {
	runCase( 'odd_TLN' );
});

test( 'dsfrk: odd, T, L, T', function t() {
	runCase( 'odd_TLT' );
});

test( 'dsfrk: odd, T, U, N', function t() {
	runCase( 'odd_TUN' );
});

test( 'dsfrk: odd, T, U, T', function t() {
	runCase( 'odd_TUT' );
});

// N=4 (even), all 8 combinations

test( 'dsfrk: even, N, L, N', function t() {
	runCase( 'even_NLN' );
});

test( 'dsfrk: even, N, L, T', function t() {
	runCase( 'even_NLT' );
});

test( 'dsfrk: even, N, U, N', function t() {
	runCase( 'even_NUN' );
});

test( 'dsfrk: even, N, U, T', function t() {
	runCase( 'even_NUT' );
});

test( 'dsfrk: even, T, L, N', function t() {
	runCase( 'even_TLN' );
});

test( 'dsfrk: even, T, L, T', function t() {
	runCase( 'even_TLT' );
});

test( 'dsfrk: even, T, U, N', function t() {
	runCase( 'even_TUN' );
});

test( 'dsfrk: even, T, U, T', function t() {
	runCase( 'even_TUT' );
});

// Larger N=5 (odd)

test( 'dsfrk: N=5, N, L, N', function t() {
	runCase( 'odd5_NLN' );
});

test( 'dsfrk: N=5, T, U, T', function t() {
	runCase( 'odd5_TUT' );
});

// Edge cases

test( 'dsfrk: N=0 quick return', function t() {
	var tc = nZero;
	var cC = new Float64Array( tc.c_in );
	var cA = new Float64Array( [ 1.0 ] );

	base( 'no-transpose', 'lower', 'no-transpose', 0, 1, 1.0, cA, 1, 1, 0, 0.0, cC, 1, 0 );

	assertArrayClose( cC, tc.c_out, 1e-14, 'n_zero' );
});

test( 'dsfrk: alpha=0, beta=1 quick return', function t() {
	var tc = alphaZeroBetaOne;
	var cC = new Float64Array( tc.c_in );
	var cA = new Float64Array( 6 );

	base( 'no-transpose', 'lower', 'no-transpose', 3, 2, 0.0, cA, 1, 3, 0, 1.0, cC, 1, 0 );

	assertArrayClose( cC, tc.c_out, 1e-14, 'alpha_zero_beta_one' );
});

test( 'dsfrk: alpha=0, beta=0 zeroes C', function t() {
	var tc = alphaZeroBetaZero;
	var cC = new Float64Array( tc.c_in );
	var cA = new Float64Array( 6 );

	base( 'no-transpose', 'lower', 'no-transpose', 3, 2, 0.0, cA, 1, 3, 0, 0.0, cC, 1, 0 );

	assertArrayClose( cC, tc.c_out, 1e-14, 'alpha_zero_beta_zero' );
});

test( 'dsfrk: K=0, beta=1 quick return', function t() {
	var tc = kZeroBetaOne;
	var cC = new Float64Array( tc.c_in );
	var cA = new Float64Array( 1 );

	base( 'no-transpose', 'lower', 'no-transpose', 3, 0, 1.0, cA, 1, 3, 0, 1.0, cC, 1, 0 );

	assertArrayClose( cC, tc.c_out, 1e-14, 'k_zero_beta_one' );
});

// Validation

test( 'ndarray: throws on invalid transr', function t() {
	var cC = new Float64Array( 6 );
	var cA = new Float64Array( 6 );

	assert.throws( function throws() {
		dsfrk.ndarray( 'invalid', 'lower', 'no-transpose', 3, 2, 1.0, cA, 1, 3, 0, 1.0, cC, 1, 0 );
	}, /TypeError/ );
});

test( 'ndarray: throws on invalid uplo', function t() {
	var cC = new Float64Array( 6 );
	var cA = new Float64Array( 6 );

	assert.throws( function throws() {
		dsfrk.ndarray( 'no-transpose', 'invalid', 'no-transpose', 3, 2, 1.0, cA, 1, 3, 0, 1.0, cC, 1, 0 );
	}, /TypeError/ );
});

test( 'ndarray: throws on invalid trans', function t() {
	var cC = new Float64Array( 6 );
	var cA = new Float64Array( 6 );

	assert.throws( function throws() {
		dsfrk.ndarray( 'no-transpose', 'lower', 'invalid', 3, 2, 1.0, cA, 1, 3, 0, 1.0, cC, 1, 0 );
	}, /TypeError/ );
});
