/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line, camelcase, stdlib/vars-order, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerqf from './../lib/ndarray.js';


// FIXTURES //

import fix3x4 from './fixtures/3x4.json' with { type: 'json' };
import fix4x3 from './fixtures/4x3.json' with { type: 'json' };
import fix3x3 from './fixtures/3x3.json' with { type: 'json' };
import fix1x1 from './fixtures/1x1.json' with { type: 'json' };
import fixMZero from './fixtures/m_zero.json' with { type: 'json' };
import fixNZero from './fixtures/n_zero.json' with { type: 'json' };
import fix2x5 from './fixtures/2x5.json' with { type: 'json' };


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
* Runs zgerqf on a packed complex column-major matrix.
*
* @private
* @param {number} M - rows
* @param {number} N - cols
* @param {Array} aFlat - interleaved re/im column-major entries (length 2*M*N)
* @returns {Object} result with A, TAU, info
*/
function runZgerqf( M, N, aFlat ) {
	var WORK;
	var TAU;
	var Av;
	var info;
	var A;
	var i;

	WORK = new Complex128Array( Math.max( 1, ( M * 32 ) + ( 32 * 32 ) ) );
	TAU = new Complex128Array( Math.max( 1, Math.min( M, N ) ) );
	A = new Complex128Array( Math.max( 1, M * N ) );
	Av = reinterpret( A, 0 );

	// Copy input into A
	for ( i = 0; i < aFlat.length; i++ ) {
		Av[ i ] = aFlat[ i ];
	}

	info = zgerqf( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0, -1 );

	return {
		'A': reinterpret( A, 0 ).subarray( 0, 2 * M * N ),
		'TAU': reinterpret( TAU, 0 ).subarray( 0, 2 * Math.min( M, N ) ),
		'info': info
	};
}


// TESTS //

test( 'zgerqf: 3x4 (M < N)', function t() {
	var aFlat;
	var res;
	var tc;

	tc = fix3x4;

	// Column-major interleaved re/im: each column has M=3 complex entries
	aFlat = [
		2,
		1,
		1,
		0,
		3,
		-1,
		1,
		2,
		4,
		1,
		2,
		0,
		3,
		0,
		2,
		-1,
		5,
		2,
		1,
		1,
		3,
		0,
		2,
		-2
	];
	res = runZgerqf( 3, 4, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 4x3 (M > N)', function t() {
	var aFlat;
	var res;
	var tc;

	tc = fix4x3;

	// Column-major interleaved re/im: each column has M=4 complex entries
	aFlat = [
		2,
		1,
		1,
		-1,
		3,
		0,
		1,
		2,
		1,
		0,
		4,
		1,
		2,
		-1,
		3,
		0,
		3,
		1,
		2,
		0,
		5,
		-2,
		1,
		1
	];
	res = runZgerqf( 4, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 3x3 (square)', function t() {
	var aFlat;
	var res;
	var tc;

	tc = fix3x3;

	// Column-major interleaved re/im: each column has M=3 complex entries
	aFlat = [
		4,
		1,
		1,
		0,
		2,
		-1,
		1,
		-1,
		3,
		2,
		1,
		0,
		2,
		0,
		1,
		1,
		5,
		-2
	];
	res = runZgerqf( 3, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 1x1', function t() {
	var aFlat;
	var res;
	var tc;

	tc = fix1x1;
	aFlat = [ 5, 3 ];
	res = runZgerqf( 1, 1, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: M=0 (quick return)', function t() {
	var WORK;
	var TAU;
	var info;
	var A;
	var tc;

	tc = fixMZero;
	A = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgerqf( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0, -1 );
	assert.equal( info, tc.info );
});

test( 'zgerqf: N=0 (quick return)', function t() {
	var WORK;
	var TAU;
	var info;
	var A;
	var tc;

	tc = fixNZero;
	A = new Complex128Array( 1 );
	TAU = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgerqf( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, -1 );
	assert.equal( info, tc.info );
});

test( 'zgerqf: 2x5 (wide)', function t() {
	var aFlat;
	var res;
	var tc;

	tc = fix2x5;
	aFlat = [
		1,
		0,
		6,
		-1,
		2,
		1,
		7,
		0,
		3,
		-1,
		8,
		2,
		4,
		0,
		9,
		-1,
		5,
		1,
		10,
		0
	];
	res = runZgerqf( 2, 5, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerqf: 40x40 (blocked path)', function t() {
	var tauNonZero;
	var aFlat;
	var res;
	var re;
	var im;
	var N;
	var i;
	var j;

	N = 40;
	aFlat = [];

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			re = ( ( ( ( i + 1 ) * 7 ) + ( ( j + 1 ) * 13 ) ) % 97 ) / 97.0;
			im = ( ( ( ( i + 1 ) * 3 ) + ( ( j + 1 ) * 11 ) ) % 89 ) / 89.0;
			aFlat.push( re, im );
		}
	}
	res = runZgerqf( N, N, aFlat );
	assert.equal( res.info, 0 );

	// Verify TAU has nonzero entries
	tauNonZero = 0;
	for ( i = 0; i < res.TAU.length; i += 2 ) {
		if ( res.TAU[ i ] !== 0.0 || res.TAU[ i + 1 ] !== 0.0 ) {
			tauNonZero += 1;
		}
	}
	assert.ok( tauNonZero > 0, 'TAU should have nonzero entries' );
});
