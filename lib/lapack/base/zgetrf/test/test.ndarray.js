/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from './../lib/ndarray.js';

// FIXTURES //

import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts 1-based Fortran IPIV to 0-based JS IPIV for comparison.
*/
function ipivTo0Based( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] - 1 );
	}
	return out;
}

/**
* Verifies P_L_U = A_original for a complex factored M x N matrix.
*
* @param {Float64Array} AorigR - original matrix as interleaved re/im (col-major, M rows, N cols, LDA=M)
* @param {Float64Array} ALUR - factored matrix from zgetrf as interleaved re/im (col-major)
* @param {Int32Array} IPIV - 0-based pivot indices from zgetrf
* @param {number} M - number of rows
* @param {number} N - number of columns
* @param {number} tol - tolerance
* @param {string} msg - error message prefix
*/
function assertFactorizationCorrect( AorigR, ALUR, IPIV, M, N, tol, msg ) {
	const minMN = Math.min( M, N );
	let sumR, sumI, LikR, LikI, UkjR, UkjI, tmpR, tmpI, idxI, idxJ, idxK, ia;
	let ib, i, j, k;

	// Compute L*U (M x N) - interleaved real/imag stored separately for clarity
	const LUR = new Float64Array( M * N );
	const LUI = new Float64Array( M * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sumR = 0.0;
			sumI = 0.0;
			for ( k = 0; k < minMN; k++ ) {
				// L(i,k): if i===k, 1.0; if i>k, ALU[i+k*M]; else 0
				if ( i === k ) {
					LikR = 1.0;
					LikI = 0.0;
				} else if ( i > k ) {
					ia = ( i + k * M ) * 2;
					LikR = ALUR[ ia ];
					LikI = ALUR[ ia + 1 ];
				} else {
					LikR = 0.0;
					LikI = 0.0;
				}
				// U(k,j): if k<=j, ALU[k+j*M]; else 0
				if ( k <= j ) {
					ib = ( k + j * M ) * 2;
					UkjR = ALUR[ ib ];
					UkjI = ALUR[ ib + 1 ];
				} else {
					UkjR = 0.0;
					UkjI = 0.0;
				}
				// Complex multiply-add: sum += Lik * Ukj
				sumR += LikR * UkjR - LikI * UkjI;
				sumI += LikR * UkjI + LikI * UkjR;
			}
			LUR[ i + j * M ] = sumR;
			LUI[ i + j * M ] = sumI;
		}
	}

	// Apply P^T (undo row interchanges in reverse) to get P*L*U
	const resultR = new Float64Array( LUR );
	const resultI = new Float64Array( LUI );
	for ( i = minMN - 1; i >= 0; i-- ) {
		if ( IPIV[ i ] !== i ) {
			for ( j = 0; j < N; j++ ) {
				idxI = i + j * M;
				idxJ = IPIV[ i ] + j * M;
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
			ia = ( i + j * M ) * 2;
			assertClose( resultR[ i + j * M ], AorigR[ ia ], tol, msg + ' PLU real[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			assertClose( resultI[ i + j * M ], AorigR[ ia + 1 ], tol, msg + ' PLU imag[' + i + ',' + j + ']' ); // eslint-disable-line max-len
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgetrf: 3x3', function t() {

	const tc = _3x3;
	const A = new Complex128Array([
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
	const IPIV = new Int32Array( 3 );
	const info = zgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf: 4x3 tall matrix', function t() {

	const A = new Complex128Array([
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
	const Aorig = new Float64Array( reinterpret( A, 0 ) );
	const IPIV = new Int32Array( 3 );
	const info = zgetrf( 4, 3, A, 1, 4, 0, IPIV, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, 0, 'info' );
	assertFactorizationCorrect( Aorig, toArray( view ), IPIV, 4, 3, 1e-13, '4x3' );
});

test( 'zgetrf: singular', function t() {

	const tc = singular;
	const A = new Complex128Array([
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
	const IPIV = new Int32Array( 3 );
	const info = zgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
	assert.equal( info, tc.info, 'info matches fixture' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf: n_zero', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 9 );
	const IPIV = new Int32Array( 3 );
	const info = zgetrf( 3, 0, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetrf: m_zero', function t() {

	const tc = m_zero;
	const A = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const info = zgetrf( 0, 3, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgetrf: 1x1', function t() {

	const tc = _1x1;
	const A = new Complex128Array( [ 5.0, 3.0 ] );
	const IPIV = new Int32Array( 1 );
	const info = zgetrf( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf: 4x4', function t() {

	const tc = _4x4;
	const A = new Complex128Array([
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
	const Aorig = new Float64Array( reinterpret( A, 0 ) );
	const IPIV = new Int32Array( 4 );
	const info = zgetrf( 4, 4, A, 1, 4, 0, IPIV, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
	assert.deepStrictEqual( toArray( IPIV ), ipivTo0Based( tc.ipiv ), 'ipiv' );
});

test( 'zgetrf: non-unit stride with offset', function t() {
	let Aorig;

	const A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0,  // padding (2 complex elements)
		4.0,
		1.0,
		3.0,
		0.5,  // col 0
		6.0,
		2.0,
		8.0,
		3.0   // col 1
	]);
	const IPIV = new Int32Array( [ 0, 0, 0, 0 ] );
	const info = zgetrf( 2, 2, A, 1, 2, 2, IPIV, 1, 1 );
	const view = reinterpret( A, 0 );
	assert.equal( info, 0, 'info' );
	const subOrig = new Float64Array( [ 4.0, 1.0, 3.0, 0.5, 6.0, 2.0, 8.0, 3.0 ] );
	const subView = toArray( view ).slice( 4, 12 );
	const subIPIV = new Int32Array( [ IPIV[ 1 ], IPIV[ 2 ] ] );
	assertFactorizationCorrect( subOrig, subView, subIPIV, 2, 2, 1e-14, 'offset' );
});

test( 'zgetrf: 70x70 blocked path (NB=64, min(M,N) > NB)', function t() {
	let view, seed, idx, i, j;

	const N = 70;
	const A = new Complex128Array( N * N );
	view = reinterpret( A, 0 );
	seed = 12345;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = ( i + j * N ) * 2;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;  // real part
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx + 1 ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;  // imag part
		}
	}
	for ( i = 0; i < N; i++ ) {
		idx = ( i + i * N ) * 2;
		view[ idx ] += 200.0;
	}
	const AorigR = new Float64Array( view );
	const IPIV = new Int32Array( N );
	const info = zgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, '70x70 info should be 0 for non-singular matrix' );
	assertFactorizationCorrect( AorigR, toArray( view ), IPIV, N, N, 1e-10, '70x70 blocked' ); // eslint-disable-line max-len
});

test( 'zgetrf: 80x70 tall blocked path', function t() {
	let view, seed, idx, i, j;

	const M = 80;
	const N = 70;
	const minMN = Math.min( M, N );
	const A = new Complex128Array( M * N );
	view = reinterpret( A, 0 );
	seed = 67890;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = ( i + j * M ) * 2;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx + 1 ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
		}
	}
	for ( i = 0; i < minMN; i++ ) {
		idx = ( i + i * M ) * 2;
		view[ idx ] += 200.0;
	}
	const AorigR = new Float64Array( view );
	const IPIV = new Int32Array( minMN );
	const info = zgetrf( M, N, A, 1, M, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, '80x70 info should be 0' );
	assertFactorizationCorrect( AorigR, toArray( view ), IPIV, M, N, 1e-10, '80x70 blocked' ); // eslint-disable-line max-len
});

test( 'zgetrf: 70x80 wide blocked path', function t() {
	let view, seed, idx, i, j;

	const M = 70;
	const N = 80;
	const minMN = Math.min( M, N );
	const A = new Complex128Array( M * N );
	view = reinterpret( A, 0 );
	seed = 11111;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = ( i + j * M ) * 2;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx + 1 ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
		}
	}
	for ( i = 0; i < minMN; i++ ) {
		idx = ( i + i * M ) * 2;
		view[ idx ] += 200.0;
	}
	const AorigR = new Float64Array( view );
	const IPIV = new Int32Array( minMN );
	const info = zgetrf( M, N, A, 1, M, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.equal( info, 0, '70x80 info should be 0' );
	assertFactorizationCorrect( AorigR, toArray( view ), IPIV, M, N, 1e-10, '70x80 blocked' ); // eslint-disable-line max-len
});

test( 'zgetrf: 70x70 singular matrix in blocked path (iinfo > 0 branch)', function t() { // eslint-disable-line max-len
	let view, seed, idx, i, j;

	const N = 70;
	const A = new Complex128Array( N * N );
	view = reinterpret( A, 0 );
	seed = 99999;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = ( i + j * N ) * 2;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
			seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
			view[ idx + 1 ] = ( seed / 0x7fffffff ) * 2.0 - 1.0;
		}
	}
	for ( i = 0; i < N; i++ ) {
		idx = ( i + i * N ) * 2;
		view[ idx ] += 200.0;
	}
	for ( i = 0; i < N; i++ ) {
		idx = ( i + 64 * N ) * 2;
		view[ idx ] = 0.0;
		view[ idx + 1 ] = 0.0;
	}
	const AorigR = new Float64Array( view );
	const IPIV = new Int32Array( N );
	const info = zgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	view = reinterpret( A, 0 );
	assert.ok( info > 0, '70x70 singular: info > 0 (got ' + info + ')' );
	assertFactorizationCorrect( AorigR, toArray( view ), IPIV, N, N, 1e-8, '70x70 singular blocked' ); // eslint-disable-line max-len
});
