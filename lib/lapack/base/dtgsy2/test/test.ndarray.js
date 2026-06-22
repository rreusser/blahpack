/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgsy2 from './../lib/ndarray.js';

// FIXTURES //

import notrans_2x2_diag from './fixtures/notrans_2x2_diag.json' with { type: 'json' };
import notrans_3x2_quasi from './fixtures/notrans_3x2_quasi.json' with { type: 'json' };
import trans_2x2 from './fixtures/trans_2x2.json' with { type: 'json' };
import notrans_2x3_bblock from './fixtures/notrans_2x3_bblock.json' with { type: 'json' };
import trans_3x2_quasi from './fixtures/trans_3x2_quasi.json' with { type: 'json' };
import trans_2x3_bblock from './fixtures/trans_2x3_bblock.json' with { type: 'json' };
import trans_3x3_both_quasi from './fixtures/trans_3x3_both_quasi.json' with { type: 'json' };
import notrans_2x1 from './fixtures/notrans_2x1.json' with { type: 'json' };
import notrans_1x2 from './fixtures/notrans_1x2.json' with { type: 'json' };
import notrans_3x3_both_quasi from './fixtures/notrans_3x3_both_quasi.json' with { type: 'json' };

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
* PackMatrix.
*
* @private
* @param {*} entries - entries
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function packMatrix( entries, M, N ) {
	var A = new Float64Array( M * N );
	var i;
	for ( i = 0; i < entries.length; i += 3 ) {
		A[ entries[ i + 1 ] * M + entries[ i ] ] = entries[ i + 2 ];
	}
	return A;
}

/**
* ExtractMatrix.
*
* @private
* @param {*} A - A
* @param {*} LDA - LDA
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function extractMatrix( A, LDA, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

// TESTS //

test( 'dtgsy2: notrans_2x2_diag', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_2x2_diag;
	M = 2;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_3x2_quasi', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_3x2_quasi;
	M = 3;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_2x2', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = trans_2x2;
	M = 2;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_2x3_bblock', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_2x3_bblock;
	M = 2;
	N = 3;
	A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	B = packMatrix([ 0, 0, 1.0, 0, 1, 0.6, 0, 2, 0.1, 1, 0, -0.6, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.3, 0, 2, 0.1, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 1.5 ], N, N);
	F = new Float64Array([ 7.0, 10.0, 8.0, 11.0, 9.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_3x2_quasi', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = trans_3x2_quasi;
	M = 3;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_2x3_bblock', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = trans_2x3_bblock;
	M = 2;
	N = 3;
	A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	B = packMatrix([ 0, 0, 1.0, 0, 1, 0.6, 0, 2, 0.1, 1, 0, -0.6, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.3, 0, 2, 0.1, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 1.5 ], N, N);
	F = new Float64Array([ 7.0, 10.0, 8.0, 11.0, 9.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_3x3_both_quasi', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = trans_3x3_both_quasi;
	M = 3;
	N = 3;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_2x1', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_2x1;
	M = 2;
	N = 1;
	A = packMatrix([ 0, 0, 3.0, 0, 1, 0.5, 1, 1, 7.0 ], M, M);
	B = packMatrix([ 0, 0, 2.0 ], N, N);
	C = new Float64Array([ 1.0, 4.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0 ], N, N);
	F = new Float64Array([ 5.0, 8.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_1x2', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_1x2;
	M = 1;
	N = 2;
	A = packMatrix([ 0, 0, 3.0 ], M, M);
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.5, 1, 1, 5.0 ], N, N);
	C = new Float64Array([ 1.0, 2.0 ]);
	D = packMatrix([ 0, 0, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 3.0 ], N, N);
	F = new Float64Array([ 5.0, 6.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: ijob=1, 2x2 diagonal (dlatdf path, local look-ahead)', function t() { // eslint-disable-line max-len
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	M = 2;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array([ 0.0 ]);
	rdscal = new Float64Array([ 1.0 ]);
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=2, 2x2 diagonal (dlatdf path, dgecon approximation)', function t() { // eslint-disable-line max-len
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	M = 2;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array([ 0.0 ]);
	rdscal = new Float64Array([ 1.0 ]);
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=1, 3x2 quasi-triangular (dlatdf with 2x1 blocks)', function t() { // eslint-disable-line max-len
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	M = 3;
	N = 2;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array([ 0.0 ]);
	rdscal = new Float64Array([ 1.0 ]);
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=2, 3x3 both quasi-triangular (dlatdf with 2x2 blocks)', function t() { // eslint-disable-line max-len
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	M = 3;
	N = 3;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array([ 0.0 ]);
	rdscal = new Float64Array([ 1.0 ]);
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=1, 2x3 with B-block (dlatdf with 1x2 blocks)', function t() { // eslint-disable-line max-len
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	M = 2;
	N = 3;
	A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	B = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.1, 1, 0, -0.5, 1, 1, 2.0, 1, 2, 0.3, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 3.0, 2.0, 4.0, 5.0, 6.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	F = new Float64Array([ 7.0, 9.0, 8.0, 10.0, 11.0, 12.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array([ 0.0 ]);
	rdscal = new Float64Array([ 1.0 ]);
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info should be non-negative (got ' + info + ')' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: notrans_3x3_both_quasi', function t() {
	var rdscal;
	var scale;
	var rdsum;
	var IWORK;
	var info;
	var tc;
	var pq;
	var M;
	var N;
	var A;
	var B;
	var C;
	var D;
	var E;
	var F;

	tc = notrans_3x3_both_quasi;
	M = 3;
	N = 3;
	A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	scale = new Float64Array( 1 );
	rdsum = new Float64Array( 1 );
	rdscal = new Float64Array( 1 );
	IWORK = new Int32Array( M + N + 6 );
	pq = new Int32Array( 1 );
	info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});
