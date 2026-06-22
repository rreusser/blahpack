/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrf from './../lib/ndarray.js';
import dsytrs from '../../dsytrs/lib/base.js';

// FIXTURES //

import _4x4_lower from './fixtures/4x4_lower.json' with { type: 'json' };
import _4x4_upper from './fixtures/4x4_upper.json' with { type: 'json' };
import _4x4_indef_lower from './fixtures/4x4_indef_lower.json' with { type: 'json' };
import _4x4_indef_upper from './fixtures/4x4_indef_upper.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import _5x5_lower from './fixtures/5x5_lower.json' with { type: 'json' };

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
* ConvertIPIV.
*
* @private
* @param {*} fipiv - fipiv
* @returns {*} result
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
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

test( 'dsytrf: 4x4_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_lower;
	A = new Float64Array([
		4,
		2,
		1,
		0,
		0,
		5,
		2,
		1,
		0,
		0,
		6,
		3,
		0,
		0,
		0,
		8
	]);
	info = dsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: 4x4_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_upper;
	A = new Float64Array( 16 );
	A[ 0 ] = 4;
	A[ 4 ] = 2;
	A[ 5 ] = 5;
	A[ 8 ] = 1;
	A[ 9 ] = 2;
	A[ 10 ] = 6;
	A[ 12 ] = 0;
	A[ 13 ] = 1;
	A[ 14 ] = 3;
	A[ 15 ] = 8;
	info = dsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: 4x4_indef_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_indef_lower;
	A = new Float64Array([
		0,
		1,
		2,
		3,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		0
	]);
	info = dsytrf( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: 4x4_indef_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 4 );
	tc = _4x4_indef_upper;
	A = new Float64Array( 16 );
	A[ 0 ] = 0;
	A[ 4 ] = 1;
	A[ 5 ] = 0;
	A[ 8 ] = 2;
	A[ 9 ] = 4;
	A[ 10 ] = 0;
	A[ 12 ] = 3;
	A[ 13 ] = 5;
	A[ 14 ] = 6;
	A[ 15 ] = 0;
	info = dsytrf( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: n_zero', function t() {
	var ipiv;
	var info;
	var A;

	ipiv = new Int32Array( 1 );
	A = new Float64Array( 1 );
	info = dsytrf( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytrf: n_one', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 1 );
	tc = n_one;
	A = new Float64Array([ 7.0 ]);
	info = dsytrf( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: singular', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 2 );
	tc = singular;
	A = new Float64Array([ 0, 0, 0, 0 ]);
	info = dsytrf( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: 5x5_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var A;

	ipiv = new Int32Array( 5 );
	tc = _5x5_lower;
	A = new Float64Array([
		1,
		-2,
		0,
		3,
		1,
		0,
		0,
		4,
		-1,
		2,
		0,
		0,
		-3,
		2,
		0,
		0,
		0,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4
	]);
	info = dsytrf( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytrf: 40x40 blocked lower (exercise dlasyf)', function t() {
	var Asave;
	var info2;
	var ipiv;
	var info;
	var sum;
	var N;
	var A;
	var b;
	var x;
	var i;
	var j;

	N = 40;
	A = new Float64Array( N * N );
	Asave = new Float64Array( N * N );
	b = new Float64Array( N );
	x = new Float64Array( N );
	ipiv = new Int32Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ i + j * N ] = 3.0 * N;
			} else {
				A[ i + j * N ] = ( ( i + j ) % 7 ) - 3.0; // values in [-3, 3]
			}
		}
	}
	Asave.set( A );
	for ( i = 0; i < N; i++ ) {
		x[ i ] = i + 1.0;
	}
	for ( i = 0; i < N; i++ ) {
		sum = 0.0;
		for ( j = 0; j < N; j++ ) {
			if ( j <= i ) {
				sum += Asave[ i + j * N ] * x[ j ];
			} else {
				sum += Asave[ j + i * N ] * x[ j ];
			}
		}
		b[ i ] = sum;
	}
	info = dsytrf( 'lower', N, A, 1, N, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'factor info' );
	info2 = dsytrs( 'lower', N, 1, A, 1, N, 0, ipiv, 1, 0, b, 1, N, 0 );
	assert.equal( info2, 0, 'solve info' );
	for ( i = 0; i < N; i++ ) {
		assertClose( b[ i ], x[ i ], 1e-10, 'x[' + i + ']' );
	}
});

test( 'dsytrf: 40x40 blocked upper (exercise dlasyf)', function t() {
	var Asave;
	var info2;
	var ipiv;
	var info;
	var sum;
	var N;
	var A;
	var b;
	var x;
	var i;
	var j;

	N = 40;
	A = new Float64Array( N * N );
	Asave = new Float64Array( N * N );
	b = new Float64Array( N );
	x = new Float64Array( N );
	ipiv = new Int32Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j * N ] = 3.0 * N;
			} else {
				A[ i + j * N ] = ( ( i + j ) % 7 ) - 3.0;
			}
		}
	}
	Asave.set( A );
	for ( i = 0; i < N; i++ ) {
		x[ i ] = i + 1.0;
	}
	for ( i = 0; i < N; i++ ) {
		sum = 0.0;
		for ( j = 0; j < N; j++ ) {
			if ( i <= j ) {
				sum += Asave[ i + j * N ] * x[ j ];
			} else {
				sum += Asave[ j + i * N ] * x[ j ];
			}
		}
		b[ i ] = sum;
	}
	info = dsytrf( 'upper', N, A, 1, N, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'factor info' );
	info2 = dsytrs( 'upper', N, 1, A, 1, N, 0, ipiv, 1, 0, b, 1, N, 0 );
	assert.equal( info2, 0, 'solve info' );
	for ( i = 0; i < N; i++ ) {
		assertClose( b[ i ], x[ i ], 1e-10, 'x[' + i + ']' );
	}
});
