/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, id-length */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetf2 from './../lib/ndarray.js';

// FIXTURES //

import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };
import _4x3_tall from './fixtures/4x3_tall.json' with { type: 'json' };
import _3x4_wide from './fixtures/3x4_wide.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };

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
* Converts 1-based Fortran IPIV to 0-based JS IPIV for comparison.
*
* @private
* @param {Array} arr - input array
* @returns {Array} output array
*/
function ipivTo0Based( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] - 1 );
	}
	return out;
}

/**
* Verifies P_L_U = A_original for a complex factored M x N matrix.
*
* @private
* @param {Float64Array} AorigR - original matrix as interleaved re/im
* @param {Float64Array} ALUR - factored matrix as interleaved re/im
* @param {Int32Array} IPIV - 0-based pivot indices
* @param {number} M - number of rows
* @param {number} N - number of columns
* @param {number} tol - tolerance
* @param {string} msg - error message prefix
*/
function assertFactorizationCorrect( AorigR, ALUR, IPIV, M, N, tol, msg ) { // eslint-disable-line max-params
	var resultR;
	var resultI;
	var minMN;
	var sumR;
	var sumI;
	var LikR;
	var LikI;
	var UkjR;
	var UkjI;
	var tmpR;
	var tmpI;
	var idxI;
	var idxJ;
	var LUR;
	var LUI;
	var ia;
	var ib;
	var i;
	var j;
	var k;

	minMN = Math.min( M, N );

	// Compute L*U (M x N)
	LUR = new Float64Array( M * N );
	LUI = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sumR = 0.0;
			sumI = 0.0;
			for ( k = 0; k < minMN; k++ ) {
				if ( i === k ) {
					LikR = 1.0;
					LikI = 0.0;
				} else if ( i > k ) {
					ia = ( i + (k * M) ) * 2;
					LikR = ALUR[ ia ];
					LikI = ALUR[ ia + 1 ];
				} else {
					LikR = 0.0;
					LikI = 0.0;
				}
				if ( k <= j ) {
					ib = ( k + (j * M) ) * 2;
					UkjR = ALUR[ ib ];
					UkjI = ALUR[ ib + 1 ];
				} else {
					UkjR = 0.0;
					UkjI = 0.0;
				}
				sumR += (LikR * UkjR) - (LikI * UkjI);
				sumI += (LikR * UkjI) + (LikI * UkjR);
			}
			LUR[ i + (j * M) ] = sumR;
			LUI[ i + (j * M) ] = sumI;
		}
	}

	// Apply P^T (undo row interchanges in reverse)
	resultR = new Float64Array( LUR );
	resultI = new Float64Array( LUI );
	for ( i = minMN - 1; i >= 0; i-- ) {
		if ( IPIV[ i ] !== i ) {
			for ( j = 0; j < N; j++ ) {
				idxI = i + (j * M);
				idxJ = IPIV[ i ] + (j * M);
				tmpR = resultR[ idxI ];
				tmpI = resultI[ idxI ];
				resultR[ idxI ] = resultR[ idxJ ];
				resultI[ idxI ] = resultI[ idxJ ];
				resultR[ idxJ ] = tmpR;
				resultI[ idxJ ] = tmpI;
			}
		}
	}

	// Compare against original (interleaved format)
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			ia = ( i + (j * M) ) * 2;
			assertClose( resultR[ i + (j * M) ], AorigR[ ia ], tol, msg + ' PLU real[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			assertClose( resultI[ i + (j * M) ], AorigR[ ia + 1 ], tol, msg + ' PLU imag[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
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

test( 'zgetf2: 3x3', function t() {
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = _3x3;
	A = new Complex128Array([
		2.0,
		1.0,
		4.0,
		2.0,
		8.0,
		3.0,
		1.0,
		0.5,
		3.0,
		1.0,
		7.0,
		2.0,
		1.0,
		0.1,
		3.0,
		0.5,
		9.0,
		1.0
	]);
	IPIV = new Int32Array( 3 );
	info = zgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetf2: 4x4', function t() {
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = _4x4;
	A = new Complex128Array([
		10.0,
		1.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		3.0,
		0.5,
		1.0,
		-1.0,
		12.0,
		2.0,
		1.0,
		3.0,
		2.0,
		-0.5,
		2.0,
		0.5,
		3.0,
		-1.0,
		15.0,
		1.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		0.5,
		3.0,
		-2.0,
		20.0,
		3.0
	]);
	IPIV = new Int32Array( 4 );
	info = zgetf2( 4, 4, A, 1, 4, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetf2: 4x3 tall matrix (M > N)', function t() {
	var Aorig;
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = _4x3_tall;
	A = new Complex128Array([
		2.0,
		1.0,
		0.0,
		0.5,
		1.0,
		0.2,
		0.0,
		0.1,
		1.0,
		0.3,
		3.0,
		1.0,
		0.0,
		0.4,
		1.0,
		0.5,
		0.0,
		0.1,
		1.0,
		0.6,
		4.0,
		2.0,
		2.0,
		1.0
	]);
	Aorig = new Float64Array( reinterpret( A, 0 ) );
	IPIV = new Int32Array( 3 );
	info = zgetf2( 4, 3, A, 1, 4, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
	assertFactorizationCorrect( Aorig, toArray( view ), IPIV, 4, 3, 1e-13, '4x3' );
});

test( 'zgetf2: 3x4 wide matrix (N > M)', function t() {
	var Aorig;
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = _3x4_wide;
	A = new Complex128Array([
		1.0,
		0.5,
		3.0,
		1.0,
		2.0,
		0.3,
		4.0,
		2.0,
		1.0,
		0.1,
		5.0,
		1.5,
		2.0,
		1.0,
		6.0,
		3.0,
		3.0,
		0.2,
		1.0,
		0.0,
		2.0,
		1.0,
		0.0,
		0.5
	]);
	Aorig = new Float64Array( reinterpret( A, 0 ) );
	IPIV = new Int32Array( 3 );
	info = zgetf2( 3, 4, A, 1, 3, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
	assertFactorizationCorrect( Aorig, toArray( view ), IPIV, 3, 4, 1e-13, '3x4' );
});

test( 'zgetf2: singular', function t() {
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = singular;
	A = new Complex128Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	IPIV = new Int32Array( 3 );
	info = zgetf2( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
	assert.equal( info, tc.info, 'info matches fixture' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetf2: n_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;

	tc = n_zero;
	A = new Complex128Array( 9 );
	IPIV = new Int32Array( 3 );
	info = zgetf2( 3, 0, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetf2: m_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;

	tc = m_zero;
	A = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zgetf2( 0, 3, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetf2: 1x1', function t() {
	var IPIV;
	var info;
	var view;
	var tc;
	var A;

	tc = _1x1;
	A = new Complex128Array( [ 5.0, 3.0 ] );
	IPIV = new Int32Array( 1 );
	info = zgetf2( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetf2: non-unit stride with offset', function t() {
	var subOrig;
	var subView;
	var subIPIV;
	var IPIV;
	var info;
	var view;
	var A;

	A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0,
		4.0,
		1.0,
		3.0,
		0.5,
		6.0,
		2.0,
		8.0,
		3.0
	]);
	IPIV = new Int32Array( [ 0, 0, 0, 0 ] );
	info = zgetf2( 2, 2, A, 1, 2, 2, IPIV, 1, 1 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, 'info' );
	subOrig = new Float64Array([
		4.0, 1.0, 3.0, 0.5, 6.0, 2.0, 8.0, 3.0
	]);
	subView = toArray( view ).slice( 4, 12 );
	subIPIV = new Int32Array( [ IPIV[ 1 ], IPIV[ 2 ] ] );
	assertFactorizationCorrect( subOrig, subView, subIPIV, 2, 2, 1e-14, 'offset' );
});

test( 'zgetf2: 10x10 random', function t() {
	var AorigR;
	var IPIV;
	var info;
	var view;
	var seed;
	var idx;
	var N;
	var A;
	var i;
	var j;

	N = 10;
	A = new Complex128Array( N * N );
	view = reinterpret( A, 0 );
	seed = 12345;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = ( i + (j * N) ) * 2;
			seed = ( (seed * 1103515245) + 12345 ) & 0x7fffffff;
			view[ idx ] = ( seed / 0x7fffffff ) * 2.0 - 1.0; // eslint-disable-line no-mixed-operators
			seed = ( (seed * 1103515245) + 12345 ) & 0x7fffffff;
			view[ idx + 1 ] = ( seed / 0x7fffffff ) * 2.0 - 1.0; // eslint-disable-line no-mixed-operators
		}
	}
	for ( i = 0; i < N; i++ ) {
		idx = ( i + (i * N) ) * 2;
		view[ idx ] += 20.0;
	}
	AorigR = new Float64Array( view );
	IPIV = new Int32Array( N );
	info = zgetf2( N, N, A, 1, N, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, '10x10 info should be 0 for non-singular matrix' );
	assertFactorizationCorrect( AorigR, toArray( view ), IPIV, N, N, 1e-12, '10x10' ); // eslint-disable-line max-len
});
