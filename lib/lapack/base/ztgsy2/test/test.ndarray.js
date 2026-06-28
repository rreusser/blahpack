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

var fixtures = {
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
	var view;
	var arr;
	var idx;
	var i;
	var j;
	arr = new Complex128Array( LDA * N );
	view = reinterpret( arr, 0 );
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
	var result;
	var view;
	var idx;
	var i;
	var j;
	view = reinterpret( arr, 0 );
	result = new Float64Array( 2 * M * N );
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
	var rdscal;
	var rdsum;
	var scale;
	var Fout;
	var Cout;
	var info;
	var tol;
	var tc;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = fixtures[ name ];
	A = packMatrix( M, M, M, Adata );
	B = packMatrix( N, N, N, Bdata );
	C = packMatrix( M, N, M, Cdata );
	D = packMatrix( M, M, M, Ddata );
	E = packMatrix( N, N, N, Edata );
	F = packMatrix( M, N, M, Fdata );
	scale = new Float64Array( [ 0.0 ] );
	rdsum = new Float64Array( [ rdsum0 || 0.0 ] );
	rdscal = new Float64Array( [ rdscal0 || 1.0 ] );
	tol = 1e-12;

	info = ztgsy2( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len

	Cout = extractMatrix( C, M, N, M, 0 );
	Fout = extractMatrix( F, M, N, M, 0 );

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
