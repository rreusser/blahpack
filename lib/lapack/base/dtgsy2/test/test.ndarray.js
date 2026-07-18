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
* PackMatrix.
*
* @private
* @param {*} entries - entries
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function packMatrix( entries, M, N ) {
	const A = new Float64Array( M * N );
	let i;
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
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

// TESTS //

test( 'dtgsy2: notrans_2x2_diag', function t() {

	const tc = notrans_2x2_diag;
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_3x2_quasi', function t() {

	const tc = notrans_3x2_quasi;
	const M = 3;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_2x2', function t() {

	const tc = trans_2x2;
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_2x3_bblock', function t() {

	const tc = notrans_2x3_bblock;
	const M = 2;
	const N = 3;
	const A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	const B = packMatrix([ 0, 0, 1.0, 0, 1, 0.6, 0, 2, 0.1, 1, 0, -0.6, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.3, 0, 2, 0.1, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 1.5 ], N, N);
	const F = new Float64Array([ 7.0, 10.0, 8.0, 11.0, 9.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_3x2_quasi', function t() {

	const tc = trans_3x2_quasi;
	const M = 3;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_2x3_bblock', function t() {

	const tc = trans_2x3_bblock;
	const M = 2;
	const N = 3;
	const A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	const B = packMatrix([ 0, 0, 1.0, 0, 1, 0.6, 0, 2, 0.1, 1, 0, -0.6, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 4.0, 2.0, 5.0, 3.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.3, 0, 2, 0.1, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 1.5 ], N, N);
	const F = new Float64Array([ 7.0, 10.0, 8.0, 11.0, 9.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: trans_3x3_both_quasi', function t() {

	const tc = trans_3x3_both_quasi;
	const M = 3;
	const N = 3;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_2x1', function t() {

	const tc = notrans_2x1;
	const M = 2;
	const N = 1;
	const A = packMatrix([ 0, 0, 3.0, 0, 1, 0.5, 1, 1, 7.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0 ], N, N);
	const C = new Float64Array([ 1.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0 ], N, N);
	const F = new Float64Array([ 5.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: notrans_1x2', function t() {

	const tc = notrans_1x2;
	const M = 1;
	const N = 2;
	const A = packMatrix([ 0, 0, 3.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.5, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 2.0 ]);
	const D = packMatrix([ 0, 0, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 5.0, 6.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});

test( 'dtgsy2: ijob=1, 2x2 diagonal (dlatdf path, local look-ahead)', function t() { // eslint-disable-line max-len

	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array([ 0.0 ]);
	const rdscal = new Float64Array([ 1.0 ]);
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=2, 2x2 diagonal (dlatdf path, dgecon approximation)', function t() { // eslint-disable-line max-len

	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array([ 0.0 ]);
	const rdscal = new Float64Array([ 1.0 ]);
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=1, 3x2 quasi-triangular (dlatdf with 2x1 blocks)', function t() { // eslint-disable-line max-len

	const M = 3;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array([ 0.0 ]);
	const rdscal = new Float64Array([ 1.0 ]);
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=2, 3x3 both quasi-triangular (dlatdf with 2x2 blocks)', function t() { // eslint-disable-line max-len

	const M = 3;
	const N = 3;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array([ 0.0 ]);
	const rdscal = new Float64Array([ 1.0 ]);
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: ijob=1, 2x3 with B-block (dlatdf with 1x2 blocks)', function t() { // eslint-disable-line max-len

	const M = 2;
	const N = 3;
	const A = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 1, 1, 4.0 ], M, M);
	const B = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.1, 1, 0, -0.5, 1, 1, 2.0, 1, 2, 0.3, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0, 5.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const F = new Float64Array([ 7.0, 9.0, 8.0, 10.0, 11.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array([ 0.0 ]);
	const rdscal = new Float64Array([ 1.0 ]);
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info should be non-negative (got ' + info + ')' );
	assert.ok( rdsum[ 0 ] > 0.0, 'rdsum should be updated (got ' + rdsum[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( rdscal[ 0 ] > 0.0, 'rdscal should be positive (got ' + rdscal[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( pq[ 0 ] > 0, 'pq should be set (got ' + pq[ 0 ] + ')' );
});

test( 'dtgsy2: notrans_3x3_both_quasi', function t() {

	const tc = notrans_3x3_both_quasi;
	const M = 3;
	const N = 3;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M); // eslint-disable-line max-len
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N); // eslint-disable-line max-len
	const C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M); // eslint-disable-line max-len
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N); // eslint-disable-line max-len
	const F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	const scale = new Float64Array( 1 );
	const rdsum = new Float64Array( 1 );
	const rdscal = new Float64Array( 1 );
	const IWORK = new Int32Array( M + N + 6 );
	const pq = new Int32Array( 1 );
	const info = dtgsy2( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, 1e-14, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, 1e-14, 'F' );
});
