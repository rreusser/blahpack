import __imp0 from './fixtures/notrans_2x2_ijob0.json' with { type: 'json' };
import __imp1 from './fixtures/notrans_3x2_ijob0.json' with { type: 'json' };
import __imp2 from './fixtures/notrans_2x2_ijob2.json' with { type: 'json' };
import __imp3 from './fixtures/conjtrans_2x2.json' with { type: 'json' };
import __imp4 from './fixtures/conjtrans_3x2.json' with { type: 'json' };
import __imp5 from './fixtures/notrans_1x2.json' with { type: 'json' };
import __imp6 from './fixtures/notrans_2x1.json' with { type: 'json' };
import __imp7 from './fixtures/notrans_3x3_ijob0.json' with { type: 'json' };
import __imp8 from './fixtures/conjtrans_3x3.json' with { type: 'json' };
import __imp9 from './fixtures/notrans_3x2_ijob2.json' with { type: 'json' };
import __imp10 from './fixtures/conjtrans_1x1.json' with { type: 'json' };
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, function-call-argument-newline, function-paren-newline, no-mixed-operators, max-statements-per-line */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsy2 from './../lib/ndarray.js';


// FIXTURES //

const fixtures = {
	'notrans_2x2_ijob0': __imp0,
	'notrans_3x2_ijob0': __imp1,
	'notrans_2x2_ijob2': __imp2,
	'conjtrans_2x2': __imp3,
	'conjtrans_3x2': __imp4,
	'notrans_1x2': __imp5,
	'notrans_2x1': __imp6,
	'notrans_3x3_ijob0': __imp7,
	'conjtrans_3x3': __imp8,
	'notrans_3x2_ijob2': __imp9,
	'conjtrans_1x1': __imp10
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
* Pack an M-by-N complex column-major matrix from interleaved data.
*
* @private
* @param {number} M - rows
* @param {number} N - columns
* @param {number} LDA - leading dimension
* @param {Array} vals - flat interleaved [re, im, ...] for M*N complex elements (column-major)
* @returns {Complex128Array} complex array of size LDA*N
*/
function packMatrix( M, N, LDA, vals ) {
	let idx, i, j;
	const arr = new Complex128Array( LDA * N );
	const view = reinterpret( arr, 0 );
	idx = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			view[ (( (j * LDA) + i ) * 2) ] = vals[ idx ];
			view[ (( (j * LDA) + i ) * 2) + 1 ] = vals[ idx + 1 ];
			idx += 2;
		}
	}
	return arr;
}

/**
* Extract M-by-N submatrix as flat Float64 interleaved array.
*
* @private
* @param {Complex128Array} arr - complex array
* @param {number} M - rows
* @param {number} N - columns
* @param {number} LDA - leading dimension
* @param {number} offset - offset in complex elements
* @returns {Float64Array} flat interleaved [re, im, ...]
*/
function extractMatrix( arr, M, N, LDA, offset ) {
	let idx, i, j;
	const view = reinterpret( arr, 0 );
	const result = new Float64Array( 2 * M * N );
	idx = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			result[ idx ] = view[ (( offset + (j * LDA) + i ) * 2) ];
			result[ idx + 1 ] = view[ (( offset + (j * LDA) + i ) * 2) + 1 ];
			idx += 2;
		}
	}
	return result;
}

/**
* Run a ztgsy2 test case.
*
* @private
* @param {string} name - test case name
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {number} ijob - 0 or 2
* @param {number} M - rows
* @param {number} N - columns
* @param {Array} Adata - M*M complex elements interleaved
* @param {Array} Bdata - N*N complex elements
* @param {Array} Cdata - M*N complex elements
* @param {Array} Ddata - M*M complex elements
* @param {Array} Edata - N*N complex elements
* @param {Array} Fdata - M*N complex elements
* @param {number} rdsum0 - initial rdsum
* @param {number} rdscal0 - initial rdscal
*/
function runTest( name, trans, ijob, M, N, Adata, Bdata, Cdata, Ddata, Edata, Fdata, rdsum0, rdscal0 ) { // eslint-disable-line max-params

	const tc = fixtures[ name ];
	const A = packMatrix( M, M, M, Adata );
	const B = packMatrix( N, N, N, Bdata );
	const C = packMatrix( M, N, M, Cdata );
	const D = packMatrix( M, M, M, Ddata );
	const E = packMatrix( N, N, N, Edata );
	const F = packMatrix( M, N, M, Fdata );
	const scale = new Float64Array( [ 0.0 ] );
	const rdsum = new Float64Array( [ rdsum0 || 0.0 ] );
	const rdscal = new Float64Array( [ rdscal0 || 1.0 ] );
	const tol = 1e-12;

	const info = ztgsy2( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len

	const Cout = extractMatrix( C, M, N, M, 0 );
	const Fout = extractMatrix( F, M, N, M, 0 );

	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, tol, 'scale' );
	assertArrayClose( Cout, tc.C, tol, 'C' );
	assertArrayClose( Fout, tc.F, tol, 'F' );

	if ( tc.rdsum !== void 0 ) {
		assertClose( rdsum[ 0 ], tc.rdsum, tol, 'rdsum' );
	}
	if ( tc.rdscal !== void 0 ) {
		assertClose( rdscal[ 0 ], tc.rdscal, tol, 'rdscal' );
	}
}


// TESTS //

test( 'ztgsy2: notrans_2x2_ijob0', function t() {
	runTest( 'notrans_2x2_ijob0', 'no-transpose', 0, 2, 2, [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ], [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ], [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ], [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ], [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ], [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: notrans_3x2_ijob0', function t() {
	runTest( 'notrans_3x2_ijob0', 'no-transpose', 0, 3, 2, [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3, 0.0, 0.0, 0.3, 0.1, 0.2, 0.0, 3.0, 0.4 ], // eslint-disable-line max-len
		[ 2.0, 0.1, 0.0, 0.0, 0.4, -0.2, 5.0, 0.3 ], [ 1.0, 0.5, 3.0, 1.0, 5.0, -0.2, 2.0, -0.5, 4.0, 0.3, 6.0, 0.7 ], [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.2, 0.1, 0.3, 0.0, 2.0, 0.2 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 3.0, 0.1 ], [ 7.0, 0.5, 9.0, 1.0, 11.0, -0.5, 8.0, -1.0, 10.0, 0.3, 12.0, 0.2 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: notrans_2x2_ijob2', function t() {
	runTest( 'notrans_2x2_ijob2', 'no-transpose', 2, 2, 2, [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ], [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ], [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ], [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ], [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ], [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ], 0.0, 1.0); // eslint-disable-line max-len
});

test( 'ztgsy2: conjtrans_2x2', function t() {
	runTest( 'conjtrans_2x2', 'conjugate-transpose', 0, 2, 2, [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ], [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ], [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ], [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ], [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ], [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: conjtrans_3x2', function t() {
	runTest( 'conjtrans_3x2', 'conjugate-transpose', 0, 3, 2, [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3, 0.0, 0.0, 0.3, 0.1, 0.2, 0.0, 3.0, 0.4 ], // eslint-disable-line max-len
		[ 2.0, 0.1, 0.0, 0.0, 0.4, -0.2, 5.0, 0.3 ], [ 1.0, 0.5, 3.0, 1.0, 5.0, -0.2, 2.0, -0.5, 4.0, 0.3, 6.0, 0.7 ], [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.2, 0.1, 0.3, 0.0, 2.0, 0.2 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 3.0, 0.1 ], [ 7.0, 0.5, 9.0, 1.0, 11.0, -0.5, 8.0, -1.0, 10.0, 0.3, 12.0, 0.2 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: notrans_1x2', function t() {
	runTest( 'notrans_1x2', 'no-transpose', 0, 1, 2, [ 3.0, 0.5 ], [ 2.0, 0.1, 0.0, 0.0, 0.5, -0.2, 5.0, 0.3 ], [ 1.0, 0.5, 2.0, -0.3 ], [ 1.5, 0.1 ], [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 3.0, 0.2 ], [ 5.0, 1.0, 6.0, -0.5 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: notrans_2x1', function t() {
	runTest( 'notrans_2x1', 'no-transpose', 0, 2, 1, [ 3.0, 0.5, 0.0, 0.0, 0.5, 0.1, 7.0, -0.2 ], [ 2.0, 0.3 ], [ 1.0, 0.5, 4.0, -0.3 ], [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, 0.1 ], [ 1.0, 0.0 ], [ 5.0, 1.0, 8.0, -0.5 ]); // eslint-disable-line max-len
});

test( 'ztgsy2: notrans_3x3_ijob0', function t() {
	runTest( 'notrans_3x3_ijob0', 'no-transpose', 0, 3, 3, [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.4, 0.1, 2.0, -0.3, 0.0, 0.0, 0.1, 0.05, 0.2, -0.1, 5.0, 0.4 ], // eslint-disable-line max-len
		[ 2.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.3, -0.1, 3.0, 0.2, 0.0, 0.0, 0.1, 0.05, 0.2, -0.1, 6.0, -0.3 ], // eslint-disable-line max-len
		[ 1.0, 0.5, 4.0, 1.0, 7.0, -0.2, 2.0, -0.5, 5.0, 0.3, 8.0, 0.7, 3.0, 0.2, 6.0, -0.4, 9.0, 0.1 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.05, 0.02, 0.2, 0.1, 2.0, 0.2 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 2.5, 0.1, 0.0, 0.0, 0.1, -0.05, 0.15, 0.05, 3.0, 0.3 ], // eslint-disable-line max-len
		[ 10.0, 0.5, 13.0, 1.0, 16.0, -0.5, 11.0, -1.0, 14.0, 0.3, 17.0, 0.2, 12.0, 0.3, 15.0, -0.5, 18.0, 0.1 ] // eslint-disable-line max-len
	);
});

test( 'ztgsy2: conjtrans_3x3', function t() {
	runTest( 'conjtrans_3x3', 'conjugate-transpose', 0, 3, 3, [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.4, 0.1, 2.0, -0.3, 0.0, 0.0, 0.1, 0.05, 0.2, -0.1, 5.0, 0.4 ], // eslint-disable-line max-len
		[ 2.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.3, -0.1, 3.0, 0.2, 0.0, 0.0, 0.1, 0.05, 0.2, -0.1, 6.0, -0.3 ], // eslint-disable-line max-len
		[ 1.0, 0.5, 4.0, 1.0, 7.0, -0.2, 2.0, -0.5, 5.0, 0.3, 8.0, 0.7, 3.0, 0.2, 6.0, -0.4, 9.0, 0.1 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.05, 0.02, 0.2, 0.1, 2.0, 0.2 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 2.5, 0.1, 0.0, 0.0, 0.1, -0.05, 0.15, 0.05, 3.0, 0.3 ], // eslint-disable-line max-len
		[ 10.0, 0.5, 13.0, 1.0, 16.0, -0.5, 11.0, -1.0, 14.0, 0.3, 17.0, 0.2, 12.0, 0.3, 15.0, -0.5, 18.0, 0.1 ] // eslint-disable-line max-len
	);
});

test( 'ztgsy2: notrans_3x2_ijob2', function t() {
	runTest( 'notrans_3x2_ijob2', 'no-transpose', 2, 3, 2, [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3, 0.0, 0.0, 0.3, 0.1, 0.2, 0.0, 3.0, 0.4 ], // eslint-disable-line max-len
		[ 2.0, 0.1, 0.0, 0.0, 0.4, -0.2, 5.0, 0.3 ], [ 1.0, 0.5, 3.0, 1.0, 5.0, -0.2, 2.0, -0.5, 4.0, 0.3, 6.0, 0.7 ], [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.2, 0.1, 0.3, 0.0, 2.0, 0.2 ], // eslint-disable-line max-len
		[ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 3.0, 0.1 ], [ 7.0, 0.5, 9.0, 1.0, 11.0, -0.5, 8.0, -1.0, 10.0, 0.3, 12.0, 0.2 ], 1.0, 1.0); // eslint-disable-line max-len
});

test( 'ztgsy2: conjtrans_1x1', function t() {
	runTest( 'conjtrans_1x1', 'conjugate-transpose', 0, 1, 1, [ 2.0, 1.0 ], [ 3.0, -0.5 ], [ 1.0, 0.5 ], [ 1.0, 0.0 ], [ 1.0, 0.0 ], [ 4.0, 2.0 ]); // eslint-disable-line max-len
});


// PROPERTY AND REFERENCE TESTS //

/**
* Builds a deterministic complex upper triangular `n`-by-`n` matrix (column-major, interleaved).
*
* @private
* @param {integer} n - order
* @param {number} shift - real shift added to the diagonal
* @param {number} phase - phase distinguishing the generated values
* @returns {Float64Array} interleaved matrix
*/
function upperTri( n, shift, phase ) {
	const out = new Float64Array( 2 * n * n );
	let k;
	let i;
	let j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			k = 2 * ( ( j * n ) + i );
			out[ k ] = 0.5 * Math.sin( ( 1.3 * k ) + phase );
			out[ k + 1 ] = 0.5 * Math.cos( ( 0.7 * k ) + phase );
			if ( i === j ) {
				out[ k ] += shift + ( 0.5 * j );
			}
		}
	}
	return out;
}

/**
* Returns the `(i,j)` element of `op(X)` (`op` = identity or conjugate transpose) of an interleaved column-major `n`-by-`n` matrix.
*
* @private
* @param {Float64Array} X - interleaved matrix
* @param {integer} n - order
* @param {boolean} ct - whether to conjugate-transpose
* @param {integer} i - row
* @param {integer} j - column
* @returns {Array<number>} `[re, im]`
*/
function cel( X, n, ct, i, j ) {
	let k;
	if ( ct ) {
		k = 2 * ( ( i * n ) + j );
		return [ X[ k ], -X[ k + 1 ] ];
	}
	k = 2 * ( ( j * n ) + i );
	return [ X[ k ], X[ k + 1 ] ];
}

/**
* Accumulates `sign * x * y` into `acc` and `|x*y|` into `mag`.
*
* @private
* @param {Array<number>} acc - accumulator `[re, im, mag]`
* @param {number} sign - sign
* @param {Array<number>} x - complex
* @param {Array<number>} y - complex
*/
function cmac( acc, sign, x, y ) {
	const re = ( x[ 0 ] * y[ 0 ] ) - ( x[ 1 ] * y[ 1 ] );
	const im = ( x[ 0 ] * y[ 1 ] ) + ( x[ 1 ] * y[ 0 ] );
	acc[ 0 ] += sign * re;
	acc[ 1 ] += sign * im;
	acc[ 2 ] += Math.abs( re ) + Math.abs( im );
}

/**
* Asserts that `(R, L)` (interleaved, M-by-N column-major) solves `A*R - L*B = scale*C, D*R - L*E = scale*F` (`no-transpose`) or `A^H*R + D^H*L = scale*C, R*B^H + L*E^H = -scale*F` (`conjugate-transpose`).
*
* @private
* @param {string} trans - transpose flag
* @param {integer} M - order of `(A, D)`
* @param {integer} N - order of `(B, E)`
* @param {Object} mats - interleaved `A, B, D, E, C0, F0, R, L`
* @param {number} scale - scale factor
* @param {string} msg - message
*/
function assertZSylvester( trans, M, N, mats, scale, msg ) {
	const ct = ( trans === 'conjugate-transpose' );
	let r1;
	let r2;
	let i;
	let j;
	let k;
	function at( X, ii, jj ) {
		const p = 2 * ( ( jj * M ) + ii );
		return [ X[ p ], X[ p + 1 ] ];
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			r1 = [ 0.0, 0.0, 0.0 ];
			r2 = [ 0.0, 0.0, 0.0 ];
			if ( ct ) {
				for ( k = 0; k < M; k++ ) {
					cmac( r1, 1.0, cel( mats.A, M, true, i, k ), at( mats.R, k, j ) );
					cmac( r1, 1.0, cel( mats.D, M, true, i, k ), at( mats.L, k, j ) );
				}
				for ( k = 0; k < N; k++ ) {
					cmac( r2, 1.0, at( mats.R, i, k ), cel( mats.B, N, true, k, j ) );
					cmac( r2, 1.0, at( mats.L, i, k ), cel( mats.E, N, true, k, j ) );
				}
				cmac( r1, -1.0, [ scale, 0.0 ], at( mats.C0, i, j ) );
				cmac( r2, 1.0, [ scale, 0.0 ], at( mats.F0, i, j ) );
			} else {
				for ( k = 0; k < M; k++ ) {
					cmac( r1, 1.0, cel( mats.A, M, false, i, k ), at( mats.R, k, j ) );
					cmac( r2, 1.0, cel( mats.D, M, false, i, k ), at( mats.R, k, j ) );
				}
				for ( k = 0; k < N; k++ ) {
					cmac( r1, -1.0, at( mats.L, i, k ), cel( mats.B, N, false, k, j ) );
					cmac( r2, -1.0, at( mats.L, i, k ), cel( mats.E, N, false, k, j ) );
				}
				cmac( r1, -1.0, [ scale, 0.0 ], at( mats.C0, i, j ) );
				cmac( r2, -1.0, [ scale, 0.0 ], at( mats.F0, i, j ) );
			}
			assert.ok( Math.abs( r1[ 0 ] ) + Math.abs( r1[ 1 ] ) <= 1e-13 * r1[ 2 ], msg + ': residual (1) at (' + i + ',' + j + ')' );
			assert.ok( Math.abs( r2[ 0 ] ) + Math.abs( r2[ 1 ] ) <= 1e-13 * r2[ 2 ], msg + ': residual (2) at (' + i + ',' + j + ')' );
		}
	}
}

test( 'ztgsy2: solutions satisfy the generalized Sylvester equations, with and without overflow scaling (both trans)', function t() {
	[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
		[ [ 3, 2 ], [ 2, 3 ], [ 1, 1 ] ].forEach( function eachSize( mn ) {
			[ 1.0, 1.0e300 ].forEach( function eachMag( mag ) {
				const msg = trans + ' ' + mn.join( 'x' ) + ' mag=' + mag;
				const M = mn[ 0 ];
				const N = mn[ 1 ];
				const mats = {
					'A': upperTri( M, 2.0, 0.3 ),
					'D': upperTri( M, 1.0, 0.9 ),
					'B': upperTri( N, -1.5, 1.1 ),
					'E': upperTri( N, 1.0, 1.7 ),
					'C0': new Float64Array( 2 * M * N ),
					'F0': new Float64Array( 2 * M * N )
				};
				let k;
				for ( k = 0; k < 2 * M * N; k++ ) {
					mats.C0[ k ] = mag * Math.sin( ( 0.9 * k ) + 0.2 );
					mats.F0[ k ] = mag * Math.cos( ( 1.1 * k ) + 0.4 );
				}
				const C = new Complex128Array( mats.C0 );
				const F = new Complex128Array( mats.F0 );
				const scale = new Float64Array( 1 );
				const rdsum = new Float64Array( [ 0.0 ] );
				const rdscal = new Float64Array( [ 1.0 ] );
				const info = ztgsy2( trans, 0, M, N, new Complex128Array( mats.A ), 1, M, 0, new Complex128Array( mats.B ), 1, N, 0, C, 1, M, 0, new Complex128Array( mats.D ), 1, M, 0, new Complex128Array( mats.E ), 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len
				assert.equal( info, 0, msg + ': info' );
				if ( mag === 1.0 ) {
					assert.equal( scale[ 0 ], 1.0, msg + ': scale' );
				} else {
					assert.ok( scale[ 0 ] > 0.0 && scale[ 0 ] < 1.0e-290, msg + ': scale ' + scale[ 0 ] );
				}
				mats.R = reinterpret( C, 0 );
				mats.L = reinterpret( F, 0 );
				assertZSylvester( trans, M, N, mats, scale[ 0 ], msg );
			});
		});
	});
});

test( 'ztgsy2: a singular 1x1 subsystem returns info > 0 and matches the reference perturbed solution (both trans)', function t() {
	// A(1,1)/D(1,1) == B(1,1)/E(1,1), so ZGETC2 perturbs a pivot. Expected values are from the reference ZTGSY2 (LAPACK 3.12.0, gfortran), IJOB=0:
	const Adata = [ 1.0, 1.0, 0.0, 0.0, 0.5, 0.25, 2.0, -1.0 ];
	const Ddata = [ 1.0, 0.0, 0.0, 0.0, 0.25, 0.0, 1.0, 0.5 ];
	const Bdata = [ 1.0, 1.0, 0.0, 0.0, 0.5, -0.5, -3.0, 1.0 ];
	const Edata = [ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ];
	const Cdata = [ 1.0, 0.5, 2.0, -1.0, 0.5, 0.0, -1.0, 1.0 ];
	const Fdata = [ 0.0, 1.0, 1.0, 1.0, -2.0, 0.5, 3.0, 0.0 ];
	const expected = {
		'no-transpose': {
			'C': [ -1.87325049191934450e15, 3.51234467234877150e15, 1.23529411764705888, 5.88235294117646912e-2, 5.58372742783649812e14, 2.20647293519346050e15, 9.55505279034690846e-1, -9.12518853695324234e-2 ],
			'F': [ -1.87325049191934475e15, 3.51234467234877150e15, 2.05882352941176433e-1, -3.23529411764705899e-1, 7.47498994371662375e14, 2.25150299509536750e14, -1.05090497737556565, 2.74132730015082982e-1 ]
		},
		'conjugate-transpose': {
			'C': [ 1.53102203666484812e14, -3.95003685459531150e15, 2.83689377382016875e14, 1.85523846795857406e14, -2.11538461538461453e-1, 5.76923076923076539e-2, 1.21794871794871806e-1, 3.84615384615384359e-2 ],
			'F': [ 3.79693465092882650e15, 4.10313905826179550e15, -4.69213224177874500e14, 9.81655305861582500e13, 6.53846153846153966e-1, -2.69230769230769273e-1, -1.33653846153846145, 1.18589743589743613e-1 ]
		}
	};
	[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
		const C = new Complex128Array( Cdata );
		const F = new Complex128Array( Fdata );
		const scale = new Float64Array( 1 );
		const rdsum = new Float64Array( [ 0.0 ] );
		const rdscal = new Float64Array( [ 1.0 ] );
		const info = ztgsy2( trans, 0, 2, 2, new Complex128Array( Adata ), 1, 2, 0, new Complex128Array( Bdata ), 1, 2, 0, C, 1, 2, 0, new Complex128Array( Ddata ), 1, 2, 0, new Complex128Array( Edata ), 1, 2, 0, F, 1, 2, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len
		assert.equal( info, 2, trans + ': info' );
		assert.equal( scale[ 0 ], 1.0, trans + ': scale' );
		assertArrayClose( reinterpret( C, 0 ), expected[ trans ].C, 1e-12, trans + ': C' );
		assertArrayClose( reinterpret( F, 0 ), expected[ trans ].F, 1e-12, trans + ': F' );
	});
});
