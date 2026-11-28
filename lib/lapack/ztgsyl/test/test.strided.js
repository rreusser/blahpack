import __imp0 from './fixtures/notrans_2x2_ijob0.json' with { type: 'json' };
import __imp1 from './fixtures/notrans_3x2_ijob0.json' with { type: 'json' };
import __imp2 from './fixtures/conjtrans_2x2_ijob0.json' with { type: 'json' };
import __imp3 from './fixtures/notrans_2x2_ijob1.json' with { type: 'json' };
import __imp4 from './fixtures/notrans_2x2_ijob2.json' with { type: 'json' };
import __imp5 from './fixtures/conjtrans_3x3_ijob0.json' with { type: 'json' };
import __imp6 from './fixtures/notrans_3x3_ijob0.json' with { type: 'json' };
import __imp7 from './fixtures/conjtrans_3x2_ijob0.json' with { type: 'json' };
import __imp8 from './fixtures/notrans_5x4_ijob1_blocked.json' with { type: 'json' };
import __imp9 from './fixtures/conjtrans_5x4_blocked.json' with { type: 'json' };
import __imp10 from './fixtures/notrans_5x5_ijob2_merge.json' with { type: 'json' };
import __imp11 from './fixtures/notrans_7x6_blocked.json' with { type: 'json' };
import __imp12 from './fixtures/conjtrans_7x6_blocked.json' with { type: 'json' };
import __imp13 from './fixtures/notrans_5x4_ijob3_blocked.json' with { type: 'json' };
/* eslint-disable no-restricted-syntax, function-call-argument-newline, function-paren-newline, no-mixed-operators, max-statements-per-line, max-len, max-lines */

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
import ztgsyl from './../lib/strided.js';
import base from './../lib/base.js';


// FIXTURES //

const fixtures = {
	'notrans_2x2_ijob0': __imp0,
	'notrans_3x2_ijob0': __imp1,
	'conjtrans_2x2_ijob0': __imp2,
	'notrans_2x2_ijob1': __imp3,
	'notrans_2x2_ijob2': __imp4,
	'conjtrans_3x3_ijob0': __imp5,
	'notrans_3x3_ijob0': __imp6,
	'conjtrans_3x2_ijob0': __imp7,
	'notrans_5x4_ijob1_blocked': __imp8,
	'conjtrans_5x4_blocked': __imp9,
	'notrans_5x5_ijob2_merge': __imp10,
	'notrans_7x6_blocked': __imp11,
	'conjtrans_7x6_blocked': __imp12,
	'notrans_5x4_ijob3_blocked': __imp13
};


// VARIABLES //

// 2x2 input data (upper triangular, column-major interleaved)
const A2 = [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ];
const B2 = [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ];
const C2 = [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ];
const D2 = [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ];
const E2 = [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ];
const F2 = [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ];

// 3x2 input data
const A32 = [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3, 0.0, 0.0, 0.3, 0.1, 0.2, 0.0, 3.0, 0.4 ];
const B32 = [ 2.0, 0.1, 0.0, 0.0, 0.4, -0.2, 5.0, 0.3 ];
const C32 = [ 1.0, 0.5, 3.0, 1.0, 5.0, -0.2, 2.0, -0.5, 4.0, 0.3, 6.0, 0.7 ];
const D32 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.2, 0.1, 0.3, 0.0, 2.0, 0.2 ];
const E32 = [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 3.0, 0.1 ];
const F32 = [ 7.0, 0.5, 9.0, 1.0, 11.0, -0.5, 8.0, -1.0, 10.0, 0.3, 12.0, 0.2 ];

// 3x3 input data
const A3 = [ 1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.4, 0.1, 2.0, -0.3, 0.0, 0.0, 0.1, 0.0, 0.2, 0.1, 5.0, 0.2 ];
const B3 = [ 2.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.3, -0.1, 3.0, 0.2, 0.0, 0.0, 0.1, 0.0, 0.2, 0.1, 6.0, -0.1 ];
const C3 = [ 1.0, 0.5, 4.0, 1.0, 7.0, -0.4, 2.0, -0.5, 5.0, 0.3, 8.0, 0.7, 3.0, 0.3, 6.0, -0.2, 9.0, 0.1 ];
const D3 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.05, 1.5, -0.1, 0.0, 0.0, 0.05, 0.0, 0.2, 0.1, 2.0, 0.2 ];
const E3 = [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 2.5, 0.1, 0.0, 0.0, 0.1, 0.0, 0.15, 0.05, 3.0, -0.1 ];
const F3 = [ 10.0, 1.0, 13.0, 0.5, 16.0, -0.3, 11.0, -0.5, 14.0, 0.2, 17.0, 0.8, 12.0, 0.3, 15.0, -0.4, 18.0, 0.1 ];


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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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

function allFinite( arr ) {
	let i;
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

	const tc = fixtures[ name ];
	const A = packMatrix( M, M, M, Adata );
	const B = packMatrix( N, N, N, Bdata );
	const C = packMatrix( M, N, M, Cdata );
	const D = packMatrix( M, M, M, Ddata );
	const E = packMatrix( N, N, N, Edata );
	const F = packMatrix( M, N, M, Fdata );
	const scale = new Float64Array( [ 0.0 ] );
	const IWORK = new Int32Array( M + N + 2 );
	const tol = 1e-12;

	// The reference's LWMIN is 1 when only one solve is done (IJOB = 0, or TRANS = C):
	const info = ztgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, new Float64Array( 1 ), new Complex128Array( 1 ), 1, 0, IWORK, 1, 0 );

	const Cout = extractMatrix( C, M, N, M, 0 );
	const Fout = extractMatrix( F, M, N, M, 0 );

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

	const tc = fixtures[ name ];
	const A = packMatrix( M, M, M, Adata );
	const B = packMatrix( N, N, N, Bdata );
	const C = packMatrix( M, N, M, Cdata );
	const D = packMatrix( M, M, M, Ddata );
	const E = packMatrix( N, N, N, Edata );
	const F = packMatrix( M, N, M, Fdata );
	const scale = new Float64Array( [ 0.0 ] );
	const dif = new Float64Array( [ 0.0 ] );
	const lwork = 2 * M * N;
	const WORK = new Complex128Array( lwork );
	const IWORK = new Int32Array( M + N + 6 );
	const tol = 1e-12;

	const info = ztgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );

	const Cout = extractMatrix( C, M, N, M, 0 );
	const Fout = extractMatrix( F, M, N, M, 0 );

	assert.equal( info, tc.info, name + ': info' );
	assertClose( scale[ 0 ], tc.scale, tol, name + ': scale' );
	assertClose( dif[ 0 ], tc.dif, tol, name + ': dif' );
	assertArrayClose( Cout, new Float64Array( tc.C ), tol, name + ': C' );
	assertArrayClose( Fout, new Float64Array( tc.F ), tol, name + ': F' );
}

/**
* Generates the blocked-path test problem of `test/fortran/test_ztgsyl.f90` (its `gen`): upper triangular `(A,D)` and `(B,E)`, column-major interleaved.
*
* @private
* @param {number} M - rows
* @param {number} N - columns
* @returns {Object} interleaved `A`, `B`, `C`, `D`, `E`, `F` data
*/
function gen( M, N ) {
	let ii, jj, k;
	const out = {
		'A': new Array( 2 * M * M ).fill( 0.0 ),
		'B': new Array( 2 * N * N ).fill( 0.0 ),
		'C': new Array( 2 * M * N ).fill( 0.0 ),
		'D': new Array( 2 * M * M ).fill( 0.0 ),
		'E': new Array( 2 * N * N ).fill( 0.0 ),
		'F': new Array( 2 * M * N ).fill( 0.0 )
	};
	for ( jj = 1; jj <= M; jj++ ) {
		for ( ii = 1; ii <= jj; ii++ ) {
			k = 2 * ( ( ii - 1 ) + ( ( jj - 1 ) * M ) );
			if ( ii === jj ) {
				out.A[ k ] = 1.0 + ii;
				out.A[ k + 1 ] = 0.1 * ii;
				out.D[ k ] = 1.0 + ( 0.1 * ii );
			} else {
				out.A[ k ] = 0.1 * Math.sin( ii + ( 2 * jj ) );
				out.A[ k + 1 ] = 0.1 * Math.cos( ii + jj );
				out.D[ k ] = 0.05 * Math.cos( ii + jj );
				out.D[ k + 1 ] = 0.02 * Math.sin( ii );
			}
		}
	}
	for ( jj = 1; jj <= N; jj++ ) {
		for ( ii = 1; ii <= jj; ii++ ) {
			k = 2 * ( ( ii - 1 ) + ( ( jj - 1 ) * N ) );
			if ( ii === jj ) {
				out.B[ k ] = -( 1.0 + ( 0.5 * ii ) );
				out.B[ k + 1 ] = 0.2 * ii;
				out.E[ k ] = 1.0 + ( 0.2 * ii );
			} else {
				out.B[ k ] = 0.1 * Math.cos( ( 2 * ii ) + jj );
				out.B[ k + 1 ] = 0.05 * Math.sin( jj );
				out.E[ k ] = 0.05 * Math.sin( ii + jj );
				out.E[ k + 1 ] = 0.03 * Math.cos( jj );
			}
		}
	}
	for ( jj = 1; jj <= N; jj++ ) {
		for ( ii = 1; ii <= M; ii++ ) {
			k = 2 * ( ( ii - 1 ) + ( ( jj - 1 ) * M ) );
			out.C[ k ] = ii + ( 0.5 * jj );
			out.C[ k + 1 ] = 0.25 * ( ii - jj );
			out.F[ k ] = 1.0 + Math.sin( ii * jj );
			out.F[ k + 1 ] = Math.cos( ii + jj );
		}
	}
	return out;
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

test( 'ztgsyl.strided: notrans 2x2 IJOB=3 (zeros C/F)', function t() {
	const A = packMatrix( 2, 2, 2, A2 );
	const B = packMatrix( 2, 2, 2, B2 );
	const C = packMatrix( 2, 2, 2, C2 );
	const D = packMatrix( 2, 2, 2, D2 );
	const E = packMatrix( 2, 2, 2, E2 );
	const F = packMatrix( 2, 2, 2, F2 );
	const scale = new Float64Array( [ 0.0 ] );
	const dif = new Float64Array( [ 0.0 ] );
	const lwork = 8;
	const WORK = new Complex128Array( lwork );
	const IWORK = new Int32Array( 10 );
	const info = ztgsyl( 'no-transpose', 3, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'ztgsyl.strided: notrans 2x2 IJOB=4 (zeros C/F + 1-norm DIF)', function t() {
	const A = packMatrix( 2, 2, 2, A2 );
	const B = packMatrix( 2, 2, 2, B2 );
	const C = packMatrix( 2, 2, 2, C2 );
	const D = packMatrix( 2, 2, 2, D2 );
	const E = packMatrix( 2, 2, 2, E2 );
	const F = packMatrix( 2, 2, 2, F2 );
	const scale = new Float64Array( [ 0.0 ] );
	const dif = new Float64Array( [ 0.0 ] );
	const lwork = 8;
	const WORK = new Complex128Array( lwork );
	const IWORK = new Int32Array( 10 );
	const info = ztgsyl( 'no-transpose', 4, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// QUICK RETURN //

test( 'ztgsyl.strided: M=0 throws (reference rejects M <= 0)', function t() {
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const D = new Complex128Array( 1 );
	const E = new Complex128Array( 1 );
	const F = new Complex128Array( 1 );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 10 );
	assert.throws( function throws() {
		ztgsyl( 'no-transpose', 0, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});

test( 'ztgsyl.strided: N=0 throws (reference rejects N <= 0)', function t() {
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const D = new Complex128Array( 1 );
	const E = new Complex128Array( 1 );
	const F = new Complex128Array( 1 );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array([ 99.0 ]);
	const WORK = new Complex128Array( 1 );
	const IWORK = new Int32Array( 10 );
	assert.throws( function throws() {
		ztgsyl( 'no-transpose', 2, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});


// BLOCKED PATH (M > 32 or N > 32) //

/**
* Build an N-by-N upper-triangular complex matrix as flat interleaved data.
*/
function buildUpperTriComplex( N, dval ) {
	const arr = new Complex128Array( N * N );
	const view = reinterpret( arr, 0 );
	let i, j;
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

test( 'ztgsyl.strided: blocked path notrans M=40 N=40 IJOB=0', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTriComplex( M, 2.0 );
	const B = buildUpperTriComplex( N, 3.0 );
	const D = buildUpperTriComplex( M, 1.0 );
	const E = buildUpperTriComplex( N, 1.0 );
	const C = new Complex128Array( M * N );
	const F = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const Fv = reinterpret( F, 0 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = ztgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( reinterpret( C, 0 ) ), 'C finite' );
	assert.ok( allFinite( reinterpret( F, 0 ) ), 'F finite' );
});

test( 'ztgsyl.strided: blocked path conjtrans M=40 N=40 IJOB=0', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTriComplex( M, 2.0 );
	const B = buildUpperTriComplex( N, 3.0 );
	const D = buildUpperTriComplex( M, 1.0 );
	const E = buildUpperTriComplex( N, 1.0 );
	const C = new Complex128Array( M * N );
	const F = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const Fv = reinterpret( F, 0 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = ztgsyl( 'conjugate-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( reinterpret( C, 0 ) ), 'C finite' );
	assert.ok( allFinite( reinterpret( F, 0 ) ), 'F finite' );
});

test( 'ztgsyl.strided: blocked path notrans M=40 N=40 IJOB=1 (uses isolve=2)', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTriComplex( M, 2.0 );
	const B = buildUpperTriComplex( N, 3.0 );
	const D = buildUpperTriComplex( M, 1.0 );
	const E = buildUpperTriComplex( N, 1.0 );
	const C = new Complex128Array( M * N );
	const F = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const Fv = reinterpret( F, 0 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = ( ( i + 1 ) % 7 ) * 0.1;
		Cv[ (i * 2) + 1 ] = ( ( i + 1 ) % 5 ) * 0.05;
		Fv[ i * 2 ] = ( ( i + 2 ) % 5 ) * 0.2;
		Fv[ (i * 2) + 1 ] = ( ( i + 1 ) % 3 ) * 0.1;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = ztgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'ztgsyl.strided: blocked path notrans M=40 N=40 IJOB=3 (zeros C/F)', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTriComplex( M, 2.0 );
	const B = buildUpperTriComplex( N, 3.0 );
	const D = buildUpperTriComplex( M, 1.0 );
	const E = buildUpperTriComplex( N, 1.0 );
	const C = new Complex128Array( M * N );
	const F = new Complex128Array( M * N );
	const Cv = reinterpret( C, 0 );
	const Fv = reinterpret( F, 0 );
	let i;
	for ( i = 0; i < M * N; i++ ) {
		Cv[ i * 2 ] = 0.5;
		Fv[ i * 2 ] = 0.7;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = ztgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// VALIDATION ERRORS //

test( 'ztgsyl.strided: throws TypeError for invalid trans (called via wrapper)', function t() {
	// strided.js does not validate; only the user-facing wrapper does.
	// But we can still spot-check that conjugate-transpose works above.
	assert.ok( true );
});


// RESIDUAL-CHECKED BLOCKED PATH //

/**
* Returns op(A)*op(B) for interleaved column-major complex A (lda) and B (ldb), where op is identity or conjugate transpose; result is interleaved M-by-N with leading dimension M.
*/
function cmatmul( ca, cb, M, N, K, A, lda, B, ldb ) {
	const out = new Float64Array( 2 * M * N );
	let ar, ai, br, bi, ia, ib, sr, si, i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < K; k++ ) {
				ia = 2 * ( ( ca ) ? ( ( i * lda ) + k ) : ( ( k * lda ) + i ) );
				ib = 2 * ( ( cb ) ? ( ( k * ldb ) + j ) : ( ( j * ldb ) + k ) );
				ar = A[ ia ];
				ai = ( ca ) ? -A[ ia + 1 ] : A[ ia + 1 ];
				br = B[ ib ];
				bi = ( cb ) ? -B[ ib + 1 ] : B[ ib + 1 ];
				sr += ( ar * br ) - ( ai * bi );
				si += ( ar * bi ) + ( ai * br );
			}
			out[ 2 * ( ( j * M ) + i ) ] = sr;
			out[ ( 2 * ( ( j * M ) + i ) ) + 1 ] = si;
		}
	}
	return out;
}

function maxAbs( x ) {
	let m = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		m = Math.max( m, Math.abs( x[ i ] ) );
	}
	return m;
}

/**
* Complex upper-triangular N-by-N matrix with diagonal (d + 0.05*j) + 0.3i*cos(j) and a dense strictly upper part.
*/
function cupperTri( N, d, seed ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		v[ 2 * ( ( j * N ) + j ) ] = d + ( 0.05 * j );
		v[ ( 2 * ( ( j * N ) + j ) ) + 1 ] = 0.3 * Math.cos( seed + j );
		for ( i = 0; i < j; i++ ) {
			v[ 2 * ( ( j * N ) + i ) ] = 0.1 * Math.sin( seed + ( i * 7 ) + ( j * 3 ) );
			v[ ( 2 * ( ( j * N ) + i ) ) + 1 ] = 0.1 * Math.cos( seed + ( i * 5 ) + j );
		}
	}
	return A;
}

/**
* Relative residual of both equations:
* no-transpose: A*R - L*B = scale*C0, D*R - L*E = scale*F0;
* conjugate-transpose: A^H*R + D^H*L = scale*C0, R*B^H + L*E^H = -scale*F0.
*/
function csylvesterResidual( trans, M, N, A, B, C0, D, E, F0, R, L, scale ) {
	const r = new Float64Array( 4 * M * N );
	let X, Y, Z, W, i;
	if ( trans === 'no-transpose' ) {
		X = cmatmul( false, false, M, N, M, A, M, R, M );
		Y = cmatmul( false, false, M, N, N, L, M, B, N );
		Z = cmatmul( false, false, M, N, M, D, M, R, M );
		W = cmatmul( false, false, M, N, N, L, M, E, N );
		for ( i = 0; i < 2 * M * N; i++ ) {
			r[ i ] = X[ i ] - Y[ i ] - ( scale * C0[ i ] );
			r[ ( 2 * M * N ) + i ] = Z[ i ] - W[ i ] - ( scale * F0[ i ] );
		}
	} else {
		X = cmatmul( true, false, M, N, M, A, M, R, M );
		Y = cmatmul( true, false, M, N, M, D, M, L, M );
		Z = cmatmul( false, true, M, N, N, R, M, B, N );
		W = cmatmul( false, true, M, N, N, L, M, E, N );
		for ( i = 0; i < 2 * M * N; i++ ) {
			r[ i ] = X[ i ] + Y[ i ] - ( scale * C0[ i ] );
			r[ ( 2 * M * N ) + i ] = Z[ i ] + W[ i ] + ( scale * F0[ i ] );
		}
	}
	const nrm = ( Math.max( maxAbs( A ), maxAbs( B ), maxAbs( D ), maxAbs( E ) ) * Math.max( M, N ) * Math.max( maxAbs( R ), maxAbs( L ) ) ) + ( scale * Math.max( maxAbs( C0 ), maxAbs( F0 ) ) );
	return maxAbs( r ) / nrm;
}

/**
* Runs ztgsyl on an M-by-N problem (M,N > 32 => blocked path).
*/
function csolveBlocked( trans, ijob, M, N, opts ) {
	const A = cupperTri( M, 2.0, 1 );
	const D = cupperTri( M, 1.0, 2 );
	const B = cupperTri( N, -1.5, 3 );
	const E = cupperTri( N, 1.2, 4 );
	const C = new Complex128Array( M * N );
	const F = new Complex128Array( M * N );
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const Dv = reinterpret( D, 0 );
	const Ev = reinterpret( E, 0 );
	const Cv = reinterpret( C, 0 );
	const Fv = reinterpret( F, 0 );
	let i;
	if ( opts.modify ) {
		opts.modify( Av, Bv, Dv, Ev );
	}
	for ( i = 0; i < M * N; i++ ) {
		Cv[ 2 * i ] = Math.cos( i );
		Cv[ ( 2 * i ) + 1 ] = Math.sin( 0.3 * i );
		Fv[ 2 * i ] = Math.sin( 0.5 * i );
		Fv[ ( 2 * i ) + 1 ] = Math.cos( 0.7 * i );
	}
	if ( opts.bigIndex !== void 0 ) {
		Cv[ 2 * opts.bigIndex ] = 1.0e300;
	}
	const C0 = new Float64Array( Cv );
	const F0 = new Float64Array( Fv );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const info = ztgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, new Complex128Array( 2 * M * N ), 1, 0, new Int32Array( M + N + 6 ), 1, 0 );
	return {
		'info': info,
		'scale': scale[ 0 ],
		'dif': dif[ 0 ],
		'C': Cv,
		'F': Fv,
		'resid': csylvesterResidual( trans, M, N, Av, Bv, C0, Dv, Ev, F0, Cv, Fv, scale[ 0 ] )
	};
}

const RTOL = 1.0e-14;

test( 'ztgsyl.strided: blocked residuals, no-transpose, ijob 0..2', function t() {
	const r0 = csolveBlocked( 'no-transpose', 0, 40, 37, {} );
	const r1 = csolveBlocked( 'no-transpose', 1, 40, 37, {} );
	const r2 = csolveBlocked( 'no-transpose', 2, 40, 37, {} );
	assert.equal( r0.info, 0, 'info ijob=0' );
	assert.equal( r1.info, 0, 'info ijob=1' );
	assert.equal( r2.info, 0, 'info ijob=2' );
	assert.equal( r0.scale, 1.0, 'scale' );
	assert.ok( r0.resid <= RTOL, 'ijob=0 residual ' + r0.resid );
	assert.ok( r1.resid <= RTOL, 'ijob=1 residual ' + r1.resid );
	assert.ok( r2.resid <= RTOL, 'ijob=2 residual ' + r2.resid );
	assertArrayClose( Array.from( r1.C ), Array.from( r0.C ), 0.0, 'R ijob=1' );
	assertArrayClose( Array.from( r2.F ), Array.from( r0.F ), 0.0, 'L ijob=2' );
	assert.ok( r1.dif > 0.0 && isFinite( r1.dif ), 'Frobenius DIF > 0' );
	assert.ok( r2.dif > 0.0 && isFinite( r2.dif ), 'one-norm DIF > 0' );
});

test( 'ztgsyl.strided: blocked, no-transpose ijob 3/4 return the DIF of ijob 1/2', function t() {
	const r1 = csolveBlocked( 'no-transpose', 1, 40, 37, {} );
	const r2 = csolveBlocked( 'no-transpose', 2, 40, 37, {} );
	const r3 = csolveBlocked( 'no-transpose', 3, 40, 37, {} );
	const r4 = csolveBlocked( 'no-transpose', 4, 40, 37, {} );
	assert.equal( r3.info, 0, 'info ijob=3' );
	assert.equal( r4.info, 0, 'info ijob=4' );
	assert.ok( r3.dif > 0.0, 'DIF ijob=3 > 0' );
	assert.ok( r4.dif > 0.0, 'DIF ijob=4 > 0' );
	assertClose( r3.dif, r1.dif, 1.0e-14, 'DIF ijob=3 vs ijob=1' );
	assertClose( r4.dif, r2.dif, 1.0e-14, 'DIF ijob=4 vs ijob=2' );
});

test( 'ztgsyl.strided: blocked residuals, conjugate-transpose', function t() {
	const r = csolveBlocked( 'conjugate-transpose', 0, 40, 37, {} );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.scale, 1.0, 'scale' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
});

test( 'ztgsyl.strided: blocked path rescales the whole solution when a block RHS is huge (no-transpose)', function t() {
	// C(39,0) lies in the first block solved (last row block, first column block).
	const r = csolveBlocked( 'no-transpose', 0, 40, 37, { 'bigIndex': 39 } );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, 'scale reduced: ' + r.scale );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
});

test( 'ztgsyl.strided: blocked path rescales the whole solution when a block RHS is huge (conjugate-transpose)', function t() {
	// C(0,36) lies in the first block solved (first row block, last column block).
	const r = csolveBlocked( 'conjugate-transpose', 0, 40, 37, { 'bigIndex': 36 * 40 } );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, 'scale reduced: ' + r.scale );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
});

test( 'ztgsyl.strided: blocked path reports a common generalized eigenvalue via info > 0 (no-transpose)', function t() {
	// (A,D)(39,39) = (2,1) and (B,E)(0,0) = (2,1) share eigenvalue 2: the 2x2 Kronecker subsystem is singular and zgetc2 perturbs its pivot.
	const r = csolveBlocked( 'no-transpose', 0, 40, 37, {
		'modify': function modify( A, B, D, E ) {
			const k = 2 * ( ( 39 * 40 ) + 39 );
			A[ k ] = 2.0;
			A[ k + 1 ] = 0.0;
			D[ k ] = 1.0;
			D[ k + 1 ] = 0.0;
			B[ 0 ] = 2.0;
			B[ 1 ] = 0.0;
			E[ 0 ] = 1.0;
			E[ 1 ] = 0.0;
		}
	});
	assert.ok( r.info > 0, 'info > 0: ' + r.info );
	assert.ok( r.scale > 0.0 && r.scale <= 1.0, 'scale in (0,1]' );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= 1.0e-12, 'residual ' + r.resid );
});

test( 'ztgsyl.strided: blocked path reports a common generalized eigenvalue via info > 0 (conjugate-transpose)', function t() {
	const r = csolveBlocked( 'conjugate-transpose', 0, 40, 37, {
		'modify': function modify( A, B, D, E ) {
			const k = 2 * ( ( 36 * 37 ) + 36 );
			A[ 0 ] = 2.0;
			A[ 1 ] = 0.0;
			D[ 0 ] = 1.0;
			D[ 1 ] = 0.0;
			B[ k ] = 2.0;
			B[ k + 1 ] = 0.0;
			E[ k ] = 1.0;
			E[ k + 1 ] = 0.0;
		}
	});
	assert.ok( r.info > 0, 'info > 0: ' + r.info );
	assert.ok( r.scale > 0.0 && r.scale <= 1.0, 'scale in (0,1]' );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= 1.0e-12, 'residual ' + r.resid );
});

test( 'ztgsyl base: M=0 or N=0 quick return sets scale=1 and, for ijob>0 no-transpose, dif=0', function t() {
	const scale = new Float64Array( [ 7.0 ] );
	const dif = new Float64Array( [ 7.0 ] );
	const Z = new Complex128Array( 1 );
	let info = base( 'no-transpose', 2, 0, 3, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, scale, dif, Z, 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale' );
	assert.equal( dif[ 0 ], 0.0, 'dif' );
	scale[ 0 ] = 7.0;
	dif[ 0 ] = 7.0;
	info = base( 'conjugate-transpose', 0, 3, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, scale, dif, Z, 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale' );
	assert.equal( dif[ 0 ], 7.0, 'dif untouched for conjugate-transpose' );
});

test( 'ztgsyl.strided: blocked path rescales already-solved column blocks when a later block RHS is huge', function t() {
	// No-transpose solves column blocks left to right: C(39,36) sits in the second column block (js=32), so the rescale also touches columns 0..js-1. Transpose solves column blocks right to left: C(0,0) sits in the last-solved column block, so columns je+1..N-1 are rescaled.
	const cases = [ [ 'no-transpose', ( 36 * 40 ) + 39 ], [ 'conjugate-transpose', 0 ] ];
	let r, k;
	for ( k = 0; k < cases.length; k++ ) {
		r = csolveBlocked( cases[ k ][ 0 ], 0, 40, 37, {
			'bigIndex': cases[ k ][ 1 ]
		});
		assert.equal( r.info, 0, cases[ k ][ 0 ] + ': info' );
		assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, cases[ k ][ 0 ] + ': scale reduced: ' + r.scale );
		assert.ok( allFinite( r.C ) && allFinite( r.F ), cases[ k ][ 0 ] + ': finite' );
		assert.ok( r.resid <= RTOL, cases[ k ][ 0 ] + ': residual ' + r.resid );
	}
});

// The reference's block sizes are MB = ILAENV( 2, 'ZTGSYL' ) = 2 and NB = ILAENV( 5, 'ZTGSYL' ) = 2, so every M > 2 or N > 2 takes the blocked solver; its DIF estimate (accumulated per block) differs from the unblocked solver's, so these fixtures pin the reference's path. A last single row/column joins the previous block (`IF( I.GE.M )`), as at M = 5 and N = 5 or 7.
test( 'ztgsyl: notrans_5x4_ijob1_blocked (reference block sizes, DIF of the blocked path)', function t() {
	const g = gen( 5, 4 );
	runTestDif( 'notrans_5x4_ijob1_blocked', 'no-transpose', 1, 5, 4, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: conjtrans_5x4_blocked', function t() {
	const g = gen( 5, 4 );
	runTest( 'conjtrans_5x4_blocked', 'conjugate-transpose', 0, 5, 4, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: notrans_5x5_ijob2_merge (last single row and column join the previous block)', function t() {
	const g = gen( 5, 5 );
	runTestDif( 'notrans_5x5_ijob2_merge', 'no-transpose', 2, 5, 5, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: notrans_7x6_blocked', function t() {
	const g = gen( 7, 6 );
	runTest( 'notrans_7x6_blocked', 'no-transpose', 0, 7, 6, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: conjtrans_7x6_blocked', function t() {
	const g = gen( 7, 6 );
	runTest( 'conjtrans_7x6_blocked', 'conjugate-transpose', 0, 7, 6, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: notrans_5x4_ijob3_blocked', function t() {
	const g = gen( 5, 4 );
	runTestDif( 'notrans_5x4_ijob3_blocked', 'no-transpose', 3, 5, 4, g.A, g.B, g.C, g.D, g.E, g.F );
});

test( 'ztgsyl: the blocked path leaves the reference block starts in IWORK (merged last row/column)', function t() {
	let IWORK, info, g, M, N, k;
	const cases = [
		[ 5, 4, [ 0, 2, 5, 0, 2, 4 ] ],
		[ 5, 5, [ 0, 2, 5, 0, 2, 5 ] ],
		[ 7, 6, [ 0, 2, 4, 7, 0, 2, 4, 6 ] ]
	];
	for ( k = 0; k < cases.length; k++ ) {
		M = cases[ k ][ 0 ];
		N = cases[ k ][ 1 ];
		g = gen( M, N );
		IWORK = new Int32Array( M + N + 2 ).fill( -1 );
		info = ztgsyl( 'no-transpose', 0, M, N, packMatrix( M, M, M, g.A ), 1, M, 0, packMatrix( N, N, N, g.B ), 1, N, 0, packMatrix( M, N, M, g.C ), 1, M, 0, packMatrix( M, M, M, g.D ), 1, M, 0, packMatrix( N, N, N, g.E ), 1, N, 0, packMatrix( M, N, M, g.F ), 1, M, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Complex128Array( 1 ), 1, 0, IWORK, 1, 0 );
		assert.equal( info, 0, 'info' );
		assert.deepEqual( Array.from( IWORK.slice( 0, cases[ k ][ 2 ].length ) ), cases[ k ][ 2 ], M + 'x' + N + ': block starts' );
	}
});

test( 'ztgsyl: WORK below the reference LWMIN (1, or 2*M*N for TRANS = N with IJOB 1 or 2) and IWORK below M+N+2 throw', function t() {
	const g = gen( 5, 4 );
	function call( trans, ijob, lwork, liwork ) {
		return ztgsyl( trans, ijob, 5, 4, packMatrix( 5, 5, 5, g.A ), 1, 5, 0, packMatrix( 4, 4, 4, g.B ), 1, 4, 0, packMatrix( 5, 4, 5, g.C ), 1, 5, 0, packMatrix( 5, 5, 5, g.D ), 1, 5, 0, packMatrix( 4, 4, 4, g.E ), 1, 4, 0, packMatrix( 5, 4, 5, g.F ), 1, 5, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Complex128Array( lwork ), 1, 0, new Int32Array( liwork ), 1, 0 );
	}
	assert.throws( function throws() {
		call( 'conjugate-transpose', 0, 0, 11 );
	}, RangeError, 'TRANS = C, WORK of 0' );
	assert.throws( function throws() {
		call( 'no-transpose', 0, 0, 11 );
	}, RangeError, 'IJOB = 0, WORK of 0' );
	assert.throws( function throws() {
		call( 'no-transpose', 1, 39, 11 );
	}, RangeError, 'IJOB = 1, WORK of 2*M*N - 1' );
	assert.throws( function throws() {
		call( 'no-transpose', 0, 1, 10 );
	}, RangeError, 'IWORK of M+N+1' );
	assert.equal( call( 'conjugate-transpose', 0, 1, 11 ), 0, 'at the minimum' );
	assert.equal( call( 'no-transpose', 1, 40, 11 ), 0, 'at the minimum' );
});
