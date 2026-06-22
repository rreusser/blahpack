/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlarfy from './../lib/ndarray.js';


// FIXTURES //

import upper3x3 from './fixtures/upper_3x3_tau1.json' with { type: 'json' };
import lower3x3 from './fixtures/lower_3x3_tau1.json' with { type: 'json' };
import tauZero from './fixtures/tau_zero.json' with { type: 'json' };
import upper2x2 from './fixtures/upper_2x2.json' with { type: 'json' };
import lower5x5 from './fixtures/lower_5x5.json' with { type: 'json' };
import nOne from './fixtures/n1.json' with { type: 'json' };


// FUNCTIONS //

/**
* Builds a column-major buffer of `LDC * N` doubles from a packed `N*N` source array.
*
* @private
* @param {Array} data - packed source data (N*N, column-major)
* @param {NonNegativeInteger} N - matrix order
* @param {PositiveInteger} LDC - leading dimension
* @returns {Float64Array} buffer
*/
function buildC( data, N, LDC ) {
	var C;
	var i;
	var j;
	C = new Float64Array( LDC * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			C[ i + ( j * LDC ) ] = data[ i + ( j * N ) ];
		}
	}
	return C;
}

/**
* Asserts that the leading N-by-N submatrix of `C` approximately equals a packed N*N reference.
*
* @private
* @param {Float64Array} C - actual buffer (LDC column-major)
* @param {Array} expected - packed reference (N*N, column-major)
* @param {NonNegativeInteger} N - matrix order
* @param {PositiveInteger} LDC - leading dimension
* @param {number} tol - tolerance
* @param {string} msg - assertion message prefix
* @throws {Error} if any element exceeds the tolerance
*/
function assertSubmatrixClose( C, expected, N, LDC, tol, msg ) {
	var relErr;
	var a;
	var b;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			a = C[ i + ( j * LDC ) ];
			b = expected[ i + ( j * N ) ];
			relErr = Math.abs( a - b ) / Math.max( Math.abs( b ), 1.0 );
			if ( relErr > tol ) {
				throw new Error( format( '%s[%d,%d]: expected %s, got %s', msg, i, j, b, a ) );
			}
		}
	}
}


// TESTS //

test( 'dlarfy: upper, 3x3, tau=1', function t() {
	var WORK;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 3;
	C = buildC([
		4,
		1,
		2,
		1,
		5,
		3,
		2,
		3,
		6
	], N, LDC );
	v = new Float64Array([
		1.0,
		0.5,
		0.25
	]);
	WORK = new Float64Array( N );
	dlarfy( 'upper', N, v, 1, 0, 1.0, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, upper3x3.C, N, LDC, 1e-13, 'C' );
});

test( 'dlarfy: lower, 3x3, tau=1', function t() {
	var WORK;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 3;
	C = buildC([
		4,
		1,
		2,
		1,
		5,
		3,
		2,
		3,
		6
	], N, LDC );
	v = new Float64Array([
		1.0,
		0.5,
		0.25
	]);
	WORK = new Float64Array( N );
	dlarfy( 'lower', N, v, 1, 0, 1.0, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, lower3x3.C, N, LDC, 1e-13, 'C' );
});

test( 'dlarfy: tau=0 quick return leaves C unchanged', function t() {
	var WORK;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 3;
	C = buildC([
		4,
		1,
		2,
		1,
		5,
		3,
		2,
		3,
		6
	], N, LDC );
	v = new Float64Array([
		1.0,
		0.5,
		0.25
	]);
	WORK = new Float64Array( N );
	dlarfy( 'upper', N, v, 1, 0, 0.0, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, tauZero.C, N, LDC, 1e-14, 'C' );
});

test( 'dlarfy: upper, 2x2', function t() {
	var WORK;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 2;
	C = buildC([
		2,
		1,
		1,
		3
	], N, LDC );
	v = new Float64Array([
		1.0,
		2.0
	]);
	WORK = new Float64Array( N );
	dlarfy( 'upper', N, v, 1, 0, 0.5, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, upper2x2.C, N, LDC, 1e-13, 'C' );
});

test( 'dlarfy: lower, 5x5', function t() {
	var WORK;
	var data;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 5;
	data = [
		10,
		1,
		2,
		3,
		4,
		1,
		11,
		5,
		6,
		7,
		2,
		5,
		12,
		8,
		9,
		3,
		6,
		8,
		13,
		1.5,
		4,
		7,
		9,
		1.5,
		14
	];
	C = buildC( data, N, LDC );
	v = new Float64Array([
		1.0,
		0.4,
		0.3,
		0.2,
		0.1
	]);
	WORK = new Float64Array( N );
	dlarfy( 'lower', N, v, 1, 0, 0.7, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, lower5x5.C, N, LDC, 1e-12, 'C' );
});

test( 'dlarfy: N=1 edge case', function t() {
	var WORK;
	var LDC;
	var N;
	var C;
	var v;
	LDC = 5;
	N = 1;
	C = new Float64Array( LDC * N );
	C[ 0 ] = 5.0;
	v = new Float64Array( [ 1.0 ] );
	WORK = new Float64Array( 1 );
	dlarfy( 'upper', N, v, 1, 0, 1.0, C, 1, LDC, 0, WORK, 1, 0 );
	assertSubmatrixClose( C, nOne.C, N, LDC, 1e-14, 'C' );
});

test( 'dlarfy: non-unit strideV is equivalent to unit stride', function t() {
	var data;
	var LDC;
	var C1;
	var C2;
	var W1;
	var W2;
	var v1;
	var v2;
	var N;
	var i;
	var j;
	var k;
	LDC = 5;
	N = 3;
	data = [
		4,
		1,
		2,
		1,
		5,
		3,
		2,
		3,
		6
	];
	C1 = buildC( data, N, LDC );
	C2 = buildC( data, N, LDC );
	v1 = new Float64Array([
		1.0,
		0.5,
		0.25
	]);
	v2 = new Float64Array([
		1.0,
		99,
		0.5,
		99,
		0.25
	]);
	W1 = new Float64Array( N );
	W2 = new Float64Array( N );
	dlarfy( 'upper', N, v1, 1, 0, 1.25, C1, 1, LDC, 0, W1, 1, 0 );
	dlarfy( 'upper', N, v2, 2, 0, 1.25, C2, 1, LDC, 0, W2, 1, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = i + ( j * LDC );
			if ( Math.abs( C2[ k ] - C1[ k ] ) > 1e-14 ) {
				throw new Error( format( 'C[%d,%d] mismatch', i, j ) );
			}
		}
	}
});

test( 'dlarfy: N=0 quick return', function t() {
	var WORK;
	var LDC;
	var C;
	var v;
	LDC = 5;
	C = new Float64Array( LDC );
	C[ 0 ] = 42.0;
	v = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	dlarfy( 'lower', 0, v, 1, 0, 2.5, C, 1, LDC, 0, WORK, 1, 0 );
	if ( C[ 0 ] !== 42.0 ) {
		throw new Error( 'C was modified on N=0' );
	}
});
