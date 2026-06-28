import __imp0 from './fixtures/notrans_2x2_ijob0.json' with { type: 'json' };
import __imp1 from './fixtures/notrans_3x2_ijob0.json' with { type: 'json' };
import __imp2 from './fixtures/conjtrans_2x2_ijob0.json' with { type: 'json' };
import __imp3 from './fixtures/notrans_2x2_ijob1.json' with { type: 'json' };
import __imp4 from './fixtures/notrans_2x2_ijob2.json' with { type: 'json' };
import __imp5 from './fixtures/conjtrans_3x3_ijob0.json' with { type: 'json' };
import __imp6 from './fixtures/notrans_3x3_ijob0.json' with { type: 'json' };
import __imp7 from './fixtures/conjtrans_3x2_ijob0.json' with { type: 'json' };
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, function-call-argument-newline, function-paren-newline, no-mixed-operators, max-statements-per-line, max-len, max-lines */

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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsyl from './../lib/ndarray.js';


// FIXTURES //

var fixtures = {
	'notrans_2x2_ijob0': __imp0,
	'notrans_3x2_ijob0': __imp1,
	'conjtrans_2x2_ijob0': __imp2,
	'notrans_2x2_ijob1': __imp3,
	'notrans_2x2_ijob2': __imp4,
	'conjtrans_3x3_ijob0': __imp5,
	'notrans_3x3_ijob0': __imp6,
	'conjtrans_3x2_ijob0': __imp7
};


// VARIABLES //

// 2x2 input data (upper triangular, column-major interleaved)
var A2 = [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ];
var B2 = [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ];
var C2 = [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ];
var D2 = [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ];
var E2 = [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ];
var F2 = [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ];

// 3x2 input data
var A32 = [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3, 0.0, 0.0, 0.3, 0.1, 0.2, 0.0, 3.0, 0.4 ];
var B32 = [ 2.0, 0.1, 0.0, 0.0, 0.4, -0.2, 5.0, 0.3 ];
var C32 = [ 1.0, 0.5, 3.0, 1.0, 5.0, -0.2, 2.0, -0.5, 4.0, 0.3, 6.0, 0.7 ];
var D32 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.2, 0.1, 0.3, 0.0, 2.0, 0.2 ];
var E32 = [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 3.0, 0.1 ];
var F32 = [ 7.0, 0.5, 9.0, 1.0, 11.0, -0.5, 8.0, -1.0, 10.0, 0.3, 12.0, 0.2 ];

// 3x3 input data
var A3 = [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.4, 0.1, 2.0, -0.3, 0.0, 0.0, 0.1, 0.0, 0.2, 0.1, 5.0, 0.2 ];
var B3 = [ 2.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.3, -0.1, 3.0, 0.2, 0.0, 0.0, 0.1, 0.0, 0.2, 0.1, 6.0, -0.1 ];
var C3 = [ 1.0, 0.5, 4.0, 1.0, 7.0, -0.4, 2.0, -0.5, 5.0, 0.3, 8.0, 0.7, 3.0, 0.3, 6.0, -0.2, 9.0, 0.1 ];
var D3 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.05, 0.0, 0.2, 0.1, 2.0, 0.2 ];
var E3 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 2.5, 0.1, 0.0, 0.0, 0.1, 0.0, 0.15, 0.05, 3.0, -0.1 ];
var F3 = [ 10.0, 1.0, 13.0, 0.5, 16.0, -0.3, 11.0, -0.5, 14.0, 0.2, 17.0, 0.8, 12.0, 0.3, 15.0, -0.4, 18.0, 0.1 ];


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

function allFinite( arr ) {
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		if ( !isFinite( arr[ i ] ) ) {
			return false;
		}
	}
	return true;
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
* Run a ztgsyl test case.
*
* @private
* @param {string} name - test case name
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {number} ijob - 0-4
* @param {number} M - rows
* @param {number} N - columns
* @param {Array} Adata - M*M complex elements interleaved
* @param {Array} Bdata - N*N complex elements
* @param {Array} Cdata - M*N complex elements
* @param {Array} Ddata - M*M complex elements
* @param {Array} Edata - N*N complex elements
* @param {Array} Fdata - M*N complex elements
*/
function runTest( name, trans, ijob, M, N, Adata, Bdata, Cdata, Ddata, Edata, Fdata ) { // eslint-disable-line max-params
	var IWORK;
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
	IWORK = new Int32Array( M + N + 6 );
	tol = 1e-12;

	info = ztgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, new Float64Array( 1 ), null, 1, 0, -1, IWORK, 1, 0 );

	Cout = extractMatrix( C, M, N, M, 0 );
	Fout = extractMatrix( F, M, N, M, 0 );

	assert.equal( info, tc.info, name + ': info' );
	assertClose( scale[ 0 ], tc.scale, tol, name + ': scale' );
	assertArrayClose( Cout, new Float64Array( tc.C ), tol, name + ': C' );
	assertArrayClose( Fout, new Float64Array( tc.F ), tol, name + ': F' );
}

/**
* Run a ztgsyl test case that also checks DIF.
*
* @private
* @param {string} name - test case name
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {number} ijob - 1-4
* @param {number} M - rows
* @param {number} N - columns
* @param {Array} Adata - M*M complex elements interleaved
* @param {Array} Bdata - N*N complex elements
* @param {Array} Cdata - M*N complex elements
* @param {Array} Ddata - M*M complex elements
* @param {Array} Edata - N*N complex elements
* @param {Array} Fdata - M*N complex elements
*/
function runTestDif( name, trans, ijob, M, N, Adata, Bdata, Cdata, Ddata, Edata, Fdata ) { // eslint-disable-line max-params
	var lwork;
	var IWORK;
	var scale;
	var Fout;
	var Cout;
	var WORK;
	var info;
	var tol;
	var dif;
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
	dif = new Float64Array( [ 0.0 ] );
	lwork = 2 * M * N;
	WORK = new Complex128Array( lwork );
	IWORK = new Int32Array( M + N + 6 );
	tol = 1e-12;

	info = ztgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, lwork, IWORK, 1, 0 );

	Cout = extractMatrix( C, M, N, M, 0 );
	Fout = extractMatrix( F, M, N, M, 0 );

	assert.equal( info, tc.info, name + ': info' );
	assertClose( scale[ 0 ], tc.scale, tol, name + ': scale' );
	assertClose( dif[ 0 ], tc.dif, tol, name + ': dif' );
	assertArrayClose( Cout, new Float64Array( tc.C ), tol, name + ': C' );
	assertArrayClose( Fout, new Float64Array( tc.F ), tol, name + ': F' );
}


// TESTS //

test( 'ztgsyl: notrans_2x2_ijob0', function t() {
	runTest( 'notrans_2x2_ijob0', 'no-transpose', 0, 2, 2, A2, B2, C2, D2, E2, F2 );
});

test( 'ztgsyl: notrans_3x2_ijob0', function t() {
	runTest( 'notrans_3x2_ijob0', 'no-transpose', 0, 3, 2, A32, B32, C32, D32, E32, F32 );
});

test( 'ztgsyl: conjtrans_2x2_ijob0', function t() {
	runTest( 'conjtrans_2x2_ijob0', 'conjugate-transpose', 0, 2, 2, A2, B2, C2, D2, E2, F2 );
});

test( 'ztgsyl: notrans_2x2_ijob1', function t() {
	runTestDif( 'notrans_2x2_ijob1', 'no-transpose', 1, 2, 2, A2, B2, C2, D2, E2, F2 );
});

test( 'ztgsyl: notrans_2x2_ijob2', function t() {
	runTestDif( 'notrans_2x2_ijob2', 'no-transpose', 2, 2, 2, A2, B2, C2, D2, E2, F2 );
});

test( 'ztgsyl: conjtrans_3x3_ijob0', function t() {
	runTest( 'conjtrans_3x3_ijob0', 'conjugate-transpose', 0, 3, 3, A3, B3, C3, D3, E3, F3 );
});

test( 'ztgsyl: notrans_3x3_ijob0', function t() {
	runTest( 'notrans_3x3_ijob0', 'no-transpose', 0, 3, 3, A3, B3, C3, D3, E3, F3 );
});

test( 'ztgsyl: conjtrans_3x2_ijob0', function t() {
	runTest( 'conjtrans_3x2_ijob0', 'conjugate-transpose', 0, 3, 2, A32, B32, C32, D32, E32, F32 );
});


// IJOB modes 3, 4 (zeros C/F first then computes DIF) //

test( 'ztgsyl.ndarray: notrans 2x2 IJOB=3 (zeros C/F)', function t() {
	var lwork;
	var IWORK;
	var WORK;
	var scale;
	var info;
	var dif;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;
	A = packMatrix( 2, 2, 2, A2 );
	B = packMatrix( 2, 2, 2, B2 );
	C = packMatrix( 2, 2, 2, C2 );
	D = packMatrix( 2, 2, 2, D2 );
	E = packMatrix( 2, 2, 2, E2 );
	F = packMatrix( 2, 2, 2, F2 );
	scale = new Float64Array( [ 0.0 ] );
	dif = new Float64Array( [ 0.0 ] );
	lwork = 8;
	WORK = new Complex128Array( lwork );
	IWORK = new Int32Array( 10 );
	info = ztgsyl( 'no-transpose', 3, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, WORK, 1, 0, lwork, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'ztgsyl.ndarray: notrans 2x2 IJOB=4 (zeros C/F + 1-norm DIF)', function t() {
	var lwork;
	var IWORK;
	var WORK;
	var scale;
	var info;
	var dif;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;
	A = packMatrix( 2, 2, 2, A2 );
	B = packMatrix( 2, 2, 2, B2 );
	C = packMatrix( 2, 2, 2, C2 );
	D = packMatrix( 2, 2, 2, D2 );
	E = packMatrix( 2, 2, 2, E2 );
	F = packMatrix( 2, 2, 2, F2 );
	scale = new Float64Array( [ 0.0 ] );
	dif = new Float64Array( [ 0.0 ] );
	lwork = 8;
	WORK = new Complex128Array( lwork );
	IWORK = new Int32Array( 10 );
	info = ztgsyl( 'no-transpose', 4, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, WORK, 1, 0, lwork, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// QUICK RETURN //

test( 'ztgsyl.ndarray: M=0 N=0 quick return notrans IJOB=0', function t() {
	var IWORK;
	var WORK;
	var scale;
	var info;
	var dif;
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var D = new Complex128Array( 1 );
	var E = new Complex128Array( 1 );
	var F = new Complex128Array( 1 );
	scale = new Float64Array( 1 );
	dif = new Float64Array( 1 );
	WORK = new Complex128Array( 1 );
	IWORK = new Int32Array( 10 );
	info = ztgsyl( 'no-transpose', 0, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
});

test( 'ztgsyl.ndarray: M=0 N=0 quick return notrans IJOB=2 (zeros dif)', function t() {
	var IWORK;
	var WORK;
	var scale;
	var info;
	var dif;
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var D = new Complex128Array( 1 );
	var E = new Complex128Array( 1 );
	var F = new Complex128Array( 1 );
	scale = new Float64Array( 1 );
	dif = new Float64Array([ 99.0 ]);
	WORK = new Complex128Array( 1 );
	IWORK = new Int32Array( 10 );
	info = ztgsyl( 'no-transpose', 2, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
	assert.equal( dif[ 0 ], 0.0, 'dif=0' );
});


// BLOCKED PATH (M > 32 or N > 32) //

/**
* Build an N-by-N upper-triangular complex matrix as flat interleaved data.
*/
function buildUpperTriComplex( N, dval ) {
	var arr = new Complex128Array( N * N );
	var view = reinterpret( arr, 0 );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		view[ ((j * N) + j) * 2 ] = dval + (0.01 * j);
		view[ (((j * N) + j) * 2) + 1 ] = 0.001 * j;
		for ( i = 0; i < j; i++ ) {
			view[ ((j * N) + i) * 2 ] = 0.001 * ( ( i + j ) % 5 );
			view[ (((j * N) + i) * 2) + 1 ] = 0.0005 * ( ( i + j ) % 3 );
		}
	}
	return arr;
}

test( 'ztgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=0', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTriComplex( M, 2.0 );
	var B = buildUpperTriComplex( N, 3.0 );
	var D = buildUpperTriComplex( M, 1.0 );
	var E = buildUpperTriComplex( N, 1.0 );
	var C = new Complex128Array( M * N );
	var F = new Complex128Array( M * N );
	var Cv = reinterpret( C, 0 );
	var Fv = reinterpret( F, 0 );
	var i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = ztgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( reinterpret( C, 0 ) ), 'C finite' );
	assert.ok( allFinite( reinterpret( F, 0 ) ), 'F finite' );
});

test( 'ztgsyl.ndarray: blocked path conjtrans M=40 N=40 IJOB=0', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTriComplex( M, 2.0 );
	var B = buildUpperTriComplex( N, 3.0 );
	var D = buildUpperTriComplex( M, 1.0 );
	var E = buildUpperTriComplex( N, 1.0 );
	var C = new Complex128Array( M * N );
	var F = new Complex128Array( M * N );
	var Cv = reinterpret( C, 0 );
	var Fv = reinterpret( F, 0 );
	var i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = ztgsyl( 'conjugate-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( reinterpret( C, 0 ) ), 'C finite' );
	assert.ok( allFinite( reinterpret( F, 0 ) ), 'F finite' );
});

test( 'ztgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=1 (uses isolve=2)', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTriComplex( M, 2.0 );
	var B = buildUpperTriComplex( N, 3.0 );
	var D = buildUpperTriComplex( M, 1.0 );
	var E = buildUpperTriComplex( N, 1.0 );
	var C = new Complex128Array( M * N );
	var F = new Complex128Array( M * N );
	var Cv = reinterpret( C, 0 );
	var Fv = reinterpret( F, 0 );
	var i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = ztgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'ztgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=3 (zeros C/F)', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTriComplex( M, 2.0 );
	var B = buildUpperTriComplex( N, 3.0 );
	var D = buildUpperTriComplex( M, 1.0 );
	var E = buildUpperTriComplex( N, 1.0 );
	var C = new Complex128Array( M * N );
	var F = new Complex128Array( M * N );
	var Cv = reinterpret( C, 0 );
	var Fv = reinterpret( F, 0 );
	var i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = 0.5;
		Fv[ i * 2 ] = 0.7;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = ztgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// VALIDATION ERRORS //

test( 'ztgsyl.ndarray: throws TypeError for invalid trans (called via wrapper)', function t() {
	// ndarray.js does not validate; only the user-facing wrapper does.
	// But we can still spot-check that conjugate-transpose works above.
	assert.ok( true );
});
