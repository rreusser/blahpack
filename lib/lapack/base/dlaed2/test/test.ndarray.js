/* eslint-disable max-len, max-statements, function-call-argument-newline, function-paren-newline, max-statements-per-line, no-restricted-syntax, no-mixed-operators, stdlib/first-unit-test, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaed2 from './../lib/ndarray.js';

// FIXTURES //

import basic_n6 from './fixtures/basic_n6.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import neg_rho from './fixtures/neg_rho.json' with { type: 'json' };
import small_z from './fixtures/small_z.json' with { type: 'json' };
import close_eigenvalues from './fixtures/close_eigenvalues.json' with { type: 'json' };
import all_deflated from './fixtures/all_deflated.json' with { type: 'json' };
import n2 from './fixtures/n2.json' with { type: 'json' };
import n8_mixed from './fixtures/n8_mixed.json' with { type: 'json' };

// FUNCTIONS //

/**
* Assert that two numbers are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Calls dlaed2 with simple column-major layout.
*
* @private
* @param {integer} N - problem size
* @param {integer} n1 - first sub-problem size
* @param {Float64Array} d - eigenvalues
* @param {Float64Array} Q - eigenvectors (N*N column-major)
* @param {Int32Array} INDXQ - sorting permutation (1-based)
* @param {number} rho - rank-1 cut weight
* @param {Float64Array} z - updating vector
* @returns {Object} result with all output arrays and info/K/rho
*/
function callDlaed2( N, n1, d, Q, INDXQ, rho, z ) {
	var DLAMBDA = new Float64Array( N );
	var COLTYP = new Int32Array( Math.max( N, 4 ) );
	var result;
	var INDXP = new Int32Array( N );
	var INDXC = new Int32Array( N );
	var INDX = new Int32Array( N );
	var Q2 = new Float64Array( N * N );
	var w = new Float64Array( N );

	result = dlaed2( N, n1, d, 1, 0, Q, 1, N, 0, INDXQ, 1, 0, rho, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': result.info,
		'K': result.K,
		'rho': result.rho,
		'd': d,
		'Q': Q,
		'z': z,
		'DLAMBDA': DLAMBDA,
		'w': w,
		'Q2': Q2,
		'INDX': INDX,
		'INDXC': INDXC,
		'INDXP': INDXP,
		'COLTYP': COLTYP
	};
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'main export is a function', function t() {
	assert.equal( typeof dlaed2, 'function' );
});

test( 'dlaed2: basic_n6 - no deflation', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;

	tc = basic_n6;
	N = tc.N;
	d = new Float64Array( [ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ] );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1.0;
	Q[ 7 ] = 1.0;
	Q[ 14 ] = 1.0;
	Q[ 21 ] = 1.0;
	Q[ 28 ] = 1.0;
	Q[ 35 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 2, 3, 1, 2, 3 ] );
	z = new Float64Array( [ 0.5, 0.6, 0.7, 0.4, 0.3, 0.2 ] );
	r = callDlaed2( N, 3, d, Q, INDXQ, 1.0, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA ), tc.DLAMBDA, 1e-14, 'DLAMBDA' );
	assertArrayClose( toArray( r.w ), tc.W, 1e-14, 'W' );
	assertArrayClose( toArray( r.Q.slice( 0, N * N ) ), tc.Q, 1e-14, 'Q' );
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: n0 - quick return for empty matrix', function t() {
	var DLAMBDA;
	var COLTYP;
	var result;
	var INDXQ;
	var INDXP;
	var INDXC;
	var INDX;
	var Q2;
	var tc;
	var d;
	var Q;
	var w;
	var z;

	DLAMBDA = new Float64Array( 0 );
	COLTYP = new Int32Array( 0 );
	INDXQ = new Int32Array( 0 );
	INDXP = new Int32Array( 0 );
	INDXC = new Int32Array( 0 );
	INDX = new Int32Array( 0 );
	Q2 = new Float64Array( 0 );
	d = new Float64Array( 0 );
	Q = new Float64Array( 0 );
	w = new Float64Array( 0 );
	z = new Float64Array( 0 );
	tc = n0;
	result = dlaed2( 0, 0, d, 1, 0, Q, 1, 1, 0, INDXQ, 1, 0, 1.0, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.INFO, 'INFO' );
	assert.equal( result.K, 0, 'K' );
});

test( 'dlaed2: neg_rho - negative rho negates second half of z', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;

	tc = neg_rho;
	N = tc.N;
	d = new Float64Array( [ 1.0, 4.0, 2.0, 5.0 ] );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1.0;
	Q[ 5 ] = 1.0;
	Q[ 10 ] = 1.0;
	Q[ 15 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 2, 1, 2 ] );
	z = new Float64Array( [ 0.3, 0.5, 0.4, 0.6 ] );
	r = callDlaed2( N, 2, d, Q, INDXQ, -2.0, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA ), tc.DLAMBDA, 1e-14, 'DLAMBDA' );
	assertArrayClose( toArray( r.w ), tc.W, 1e-14, 'W' );
	assertArrayClose( toArray( r.Q.slice( 0, N * N ) ), tc.Q, 1e-14, 'Q' );
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: small_z - deflation via small z component', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;

	tc = small_z;
	N = tc.N;
	d = new Float64Array( [ 1.0, 3.0, 2.0, 5.0 ] );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1.0;
	Q[ 5 ] = 1.0;
	Q[ 10 ] = 1.0;
	Q[ 15 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 2, 1, 2 ] );
	z = new Float64Array( [ 0.5, 1.0e-20, 0.4, 0.3 ] );
	r = callDlaed2( N, 2, d, Q, INDXQ, 1.0, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA.slice( 0, r.K ) ), tc.DLAMBDA.slice( 0, r.K ), 1e-14, 'DLAMBDA' ); // eslint-disable-line max-len
	assertArrayClose( toArray( r.w.slice( 0, r.K ) ), tc.W.slice( 0, r.K ), 1e-14, 'W' ); // eslint-disable-line max-len
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: close_eigenvalues - deflation via close eigenvalues', function t() { // eslint-disable-line max-len
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;

	tc = close_eigenvalues;
	N = tc.N;
	d = new Float64Array( [ 1.0, 3.0, 1.0 + 1.0e-16, 5.0 ] );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1.0;
	Q[ 5 ] = 1.0;
	Q[ 10 ] = 1.0;
	Q[ 15 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 2, 1, 2 ] );
	z = new Float64Array( [ 0.5, 0.6, 0.4, 0.3 ] );
	r = callDlaed2( N, 2, d, Q, INDXQ, 1.0, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA.slice( 0, r.K ) ), tc.DLAMBDA.slice( 0, r.K ), 1e-14, 'DLAMBDA' ); // eslint-disable-line max-len
	assertArrayClose( toArray( r.w.slice( 0, r.K ) ), tc.W.slice( 0, r.K ), 1e-14, 'W' ); // eslint-disable-line max-len
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: all_deflated - all z components tiny', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;

	tc = all_deflated;
	N = tc.N;
	d = new Float64Array( [ 1.0, 3.0, 2.0, 5.0 ] );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1.0;
	Q[ 5 ] = 1.0;
	Q[ 10 ] = 1.0;
	Q[ 15 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 2, 1, 2 ] );
	z = new Float64Array( [ 1.0e-20, 1.0e-20, 1.0e-20, 1.0e-20 ] );
	r = callDlaed2( N, 2, d, Q, INDXQ, 1.0, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K = 0 (all deflated)' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( r.Q.slice( 0, N * N ) ), tc.Q, 1e-14, 'Q' );
});

test( 'dlaed2: n2 - minimal case N=2, N1=1', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var r;

	tc = n2;
	d = new Float64Array( [ 3.0, 1.0 ] );
	Q = new Float64Array( 4 );
	Q[ 0 ] = 1.0;
	Q[ 3 ] = 1.0;
	INDXQ = new Int32Array( [ 1, 1 ] );
	z = new Float64Array( [ 0.7, 0.7 ] );
	r = callDlaed2( 2, 1, d, Q, INDXQ, 0.5, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA.slice( 0, r.K ) ), tc.DLAMBDA.slice( 0, r.K ), 1e-14, 'DLAMBDA' ); // eslint-disable-line max-len
	assertArrayClose( toArray( r.w.slice( 0, r.K ) ), tc.W.slice( 0, r.K ), 1e-14, 'W' ); // eslint-disable-line max-len
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: n8_mixed - larger case with mixed deflation', function t() {
	var INDXQ;
	var tc;
	var Q;
	var d;
	var z;
	var N;
	var r;
	var i;

	tc = n8_mixed;
	N = tc.N;
	d = new Float64Array( [ 1.0, 3.0, 5.5, 7.0, 2.0, 4.0, 5.5 + 1.0e-16, 9.0 ] );
	Q = new Float64Array( N * N );
	for ( i = 0; i < N; i += 1 ) {
		Q[ ( i * N ) + i ] = 1.0;
	}
	INDXQ = new Int32Array( [ 1, 2, 3, 4, 1, 2, 3, 4 ] );
	z = new Float64Array( [ 0.3, 0.4, 0.5, 0.2, 0.35, 0.45, 0.25, 0.15 ] );
	r = callDlaed2( N, 4, d, Q, INDXQ, 1.5, z );
	assert.equal( r.info, tc.INFO, 'INFO' );
	assert.equal( r.K, tc.K, 'K' );
	assertClose( r.rho, tc.RHO, 1e-14, 'RHO' );
	assertArrayClose( toArray( r.DLAMBDA.slice( 0, r.K ) ), tc.DLAMBDA.slice( 0, r.K ), 1e-14, 'DLAMBDA' ); // eslint-disable-line max-len
	assertArrayClose( toArray( r.w.slice( 0, r.K ) ), tc.W.slice( 0, r.K ), 1e-14, 'W' ); // eslint-disable-line max-len
	assert.deepEqual( toArray( r.COLTYP.slice( 0, 4 ) ), tc.COLTYP, 'COLTYP' );
});

test( 'dlaed2: returns rho = ABS(2*rho)', function t() {
	var result;

	// Rho = 3.5 => returns ABS(2*3.5) = 7.0
	result = callDlaed2( 2, 1, new Float64Array( [ 1.0, 2.0 ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ), new Int32Array( [ 1, 1 ] ), 3.5, new Float64Array( [ 0.5, 0.5 ] ) ); // eslint-disable-line max-len
	assertClose( result.rho, 7.0, 1e-14, 'rho=ABS(2*3.5)' );

	// Rho = -2.0 => returns ABS(2*(-2)) = 4.0
	result = callDlaed2( 2, 1, new Float64Array( [ 1.0, 2.0 ] ), new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] ), new Int32Array( [ 1, 1 ] ), -2.0, new Float64Array( [ 0.5, 0.5 ] ) ); // eslint-disable-line max-len
	assertClose( result.rho, 4.0, 1e-14, 'rho=ABS(2*(-2))' );
});

test( 'dlaed2: deflated D values sorted in increasing order', function t() {
	var r;
	var i;

	r = callDlaed2( 4, 2, new Float64Array( [ 1.0, 3.0, 2.0, 5.0 ] ), new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] ), new Int32Array( [ 1, 2, 1, 2 ] ), 1.0, new Float64Array( [ 0.5, 1.0e-20, 0.4, 0.3 ] ) ); // eslint-disable-line max-len

	// Verify deflated D entries (from K+1 to N) are in increasing order
	for ( i = r.K; i < 3; i += 1 ) {
		assert.ok( r.d[ i ] <= r.d[ i + 1 ], 'D[' + i + '] <= D[' + ( i + 1 ) + ']: ' + r.d[ i ] + ' <= ' + r.d[ i + 1 ] ); // eslint-disable-line max-len
	}
});
