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


// PROPERTY TESTS //

/**
* Builds a deterministic upper quasi-triangular/upper triangular pair `(A, D)` of order `n` (column-major) with diagonal blocks of the given sizes.
*
* @private
* @param {Array<integer>} blocks - diagonal block sizes (1 or 2)
* @param {number} shift - shift added to the diagonal of `A` (separates the spectra of the two pairs)
* @param {number} phase - phase distinguishing the generated values
* @returns {Object} object containing `A` and `D`
*/
function schurPair( blocks, shift, phase ) {
	let n = 0;
	let s = 0;
	let i;
	let j;
	let b;
	for ( b = 0; b < blocks.length; b++ ) {
		n += blocks[ b ];
	}
	const A = new Float64Array( n * n );
	const D = new Float64Array( n * n );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < j; i++ ) {
			A[ ( j * n ) + i ] = 0.5 * Math.sin( ( 1.3 * ( ( j * n ) + i ) ) + phase );
			D[ ( j * n ) + i ] = 0.25 * Math.cos( ( 0.7 * ( ( j * n ) + i ) ) + phase );
		}
		A[ ( j * n ) + j ] = shift + ( 0.5 * j );
		D[ ( j * n ) + j ] = 1.0 + ( 0.1 * j );
	}
	for ( b = 0; b < blocks.length; b++ ) {
		if ( blocks[ b ] === 2 ) {
			// 2x2 block with complex conjugate eigenvalues: A(s+1,s) != 0, D(s,s+1) = 0
			A[ ( s * n ) + s + 1 ] = -0.75;
			A[ ( ( s + 1 ) * n ) + s ] = 0.9;
			A[ ( ( s + 1 ) * n ) + s + 1 ] = A[ ( s * n ) + s ];
			D[ ( ( s + 1 ) * n ) + s ] = 0.0;
			D[ ( ( s + 1 ) * n ) + s + 1 ] = D[ ( s * n ) + s ];
		}
		s += blocks[ b ];
	}
	return {
		'A': A,
		'D': D,
		'n': n
	};
}

/**
* Returns the `(i,j)` element of `op(X)` for a column-major `n`-by-`n` matrix `X`.
*
* @private
* @param {Float64Array} X - matrix
* @param {integer} n - order
* @param {boolean} tr - whether to transpose
* @param {integer} i - row
* @param {integer} j - column
* @returns {number} element
*/
function el( X, n, tr, i, j ) {
	return ( tr ) ? X[ ( i * n ) + j ] : X[ ( j * n ) + i ];
}

/**
* Asserts that `(R, L)` solves the generalized Sylvester equation (1) (`trans = 'no-transpose'`) or (3) (`trans = 'transpose'`) with the given `scale`, to a residual relative to the magnitudes of the terms.
*
* @private
* @param {string} trans - transpose flag
* @param {Object} P - pair `(A, D)` of order `M`
* @param {Object} Q - pair `(B, E)` of order `N`
* @param {Float64Array} C0 - original right-hand side `C`
* @param {Float64Array} F0 - original right-hand side `F`
* @param {Float64Array} R - solution `R` (output `C`)
* @param {Float64Array} L - solution `L` (output `F`)
* @param {number} scale - scale factor
* @param {string} msg - message
*/
function assertSylvester( trans, P, Q, C0, F0, R, L, scale, msg ) {
	const M = P.n;
	const N = Q.n;
	const tr = ( trans === 'transpose' );
	let r1;
	let r2;
	let m1;
	let m2;
	let t;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			r1 = 0.0;
			r2 = 0.0;
			m1 = 0.0;
			m2 = 0.0;
			if ( tr ) {
				// A^T*R + D^T*L = scale*C ; R*B^T + L*E^T = -scale*F
				for ( k = 0; k < M; k++ ) {
					t = ( el( P.A, M, true, i, k ) * R[ ( j * M ) + k ] ) + ( el( P.D, M, true, i, k ) * L[ ( j * M ) + k ] );
					r1 += t;
					m1 += Math.abs( el( P.A, M, true, i, k ) * R[ ( j * M ) + k ] ) + Math.abs( el( P.D, M, true, i, k ) * L[ ( j * M ) + k ] );
				}
				for ( k = 0; k < N; k++ ) {
					r2 += ( R[ ( k * M ) + i ] * el( Q.A, N, true, k, j ) ) + ( L[ ( k * M ) + i ] * el( Q.D, N, true, k, j ) );
					m2 += Math.abs( R[ ( k * M ) + i ] * el( Q.A, N, true, k, j ) ) + Math.abs( L[ ( k * M ) + i ] * el( Q.D, N, true, k, j ) );
				}
				r1 -= scale * C0[ ( j * M ) + i ];
				r2 += scale * F0[ ( j * M ) + i ];
			} else {
				// A*R - L*B = scale*C ; D*R - L*E = scale*F
				for ( k = 0; k < M; k++ ) {
					r1 += el( P.A, M, false, i, k ) * R[ ( j * M ) + k ];
					r2 += el( P.D, M, false, i, k ) * R[ ( j * M ) + k ];
					m1 += Math.abs( el( P.A, M, false, i, k ) * R[ ( j * M ) + k ] );
					m2 += Math.abs( el( P.D, M, false, i, k ) * R[ ( j * M ) + k ] );
				}
				for ( k = 0; k < N; k++ ) {
					r1 -= L[ ( k * M ) + i ] * el( Q.A, N, false, k, j );
					r2 -= L[ ( k * M ) + i ] * el( Q.D, N, false, k, j );
					m1 += Math.abs( L[ ( k * M ) + i ] * el( Q.A, N, false, k, j ) );
					m2 += Math.abs( L[ ( k * M ) + i ] * el( Q.D, N, false, k, j ) );
				}
				r1 -= scale * C0[ ( j * M ) + i ];
				r2 -= scale * F0[ ( j * M ) + i ];
			}
			m1 += Math.abs( scale * C0[ ( j * M ) + i ] );
			m2 += Math.abs( scale * F0[ ( j * M ) + i ] );
			assert.ok( Math.abs( r1 ) <= 1e-13 * m1, msg + ': residual (1) at (' + i + ',' + j + ') = ' + r1 + ' (magnitude ' + m1 + ')' );
			assert.ok( Math.abs( r2 ) <= 1e-13 * m2, msg + ': residual (2) at (' + i + ',' + j + ') = ' + r2 + ' (magnitude ' + m2 + ')' );
		}
	}
}

test( 'dtgsy2: solutions satisfy the generalized Sylvester equations across 1x1/2x2 block layouts (both trans, with and without overflow scaling)', function t() {
	const aBlocks = [ [ 1, 2 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2, 1 ] ];
	const bBlocks = [ [ 2, 1 ], [ 1, 2 ], [ 2, 1, 1 ], [ 1 ], [ 2 ] ];
	[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
		aBlocks.forEach( function eachA( ab ) {
			bBlocks.forEach( function eachB( bb ) {
				[ 1.0, 1.0e300 ].forEach( function eachMag( mag ) {
					const msg = trans + ' A=' + ab.join( '' ) + ' B=' + bb.join( '' ) + ' mag=' + mag;
					const P = schurPair( ab, 2.0, 0.3 );
					const Q = schurPair( bb, -1.5, 1.1 );
					const M = P.n;
					const N = Q.n;
					const C0 = new Float64Array( M * N );
					const F0 = new Float64Array( M * N );
					let k;
					for ( k = 0; k < M * N; k++ ) {
						C0[ k ] = mag * Math.sin( ( 0.9 * k ) + 0.2 );
						F0[ k ] = mag * Math.cos( ( 1.1 * k ) + 0.4 );
					}
					const C = new Float64Array( C0 );
					const F = new Float64Array( F0 );
					const scale = new Float64Array( 1 );
					const rdsum = new Float64Array( 1 );
					const rdscal = new Float64Array( 1 );
					const IWORK = new Int32Array( M + N + 6 );
					const pq = new Int32Array( 1 );
					const info = dtgsy2( trans, 0, M, N, P.A, 1, M, 0, Q.A, 1, N, 0, C, 1, M, 0, P.D, 1, M, 0, Q.D, 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
					assert.equal( info, 0, msg + ': info' );
					if ( mag === 1.0 ) {
						assert.equal( scale[ 0 ], 1.0, msg + ': scale' );
					} else {
						assert.ok( scale[ 0 ] > 0.0 && scale[ 0 ] < 1.0e-290, msg + ': scale ' + scale[ 0 ] );
					}
					assertSylvester( trans, P, Q, C0, F0, C, F, scale[ 0 ], msg );
				});
			});
		});
	});
});

// Singular-subsystem cases: the generalized spectra of (A,D) and (B,E) intersect, so DGETC2 perturbs a pivot and DTGSY2 returns `info > 0`. Expected values are from the reference DTGSY2 (LAPACK 3.12.0, gfortran) called with IJOB=0, LDx=2, C=[1,2;3,4] (column-major [1,2,3,4]) and F=[-1,0.5,2,-3] (column-major), truncated to the leading M-by-N block.
const SINGULAR_CASES = [
	{
		'name': '1x2 (mb=1, nb=2)',
		'M': 1,
		'N': 2,
		'A': [ 2.0 ],
		'D': [ 1.0 ],
		'B': [ 1.0, 1.0, 1.0, 1.0 ],
		'E': [ 1.0, 0.0, 0.0, 1.0 ],
		'C0': [ 1.0, 3.0 ],
		'F0': [ -1.0, 2.0 ],
		'no-transpose': {
			'info': 4,
			'C': [ -2.25179981368524800e15, -2.25179981368524700e15 ],
			'F': [ -2.25179981368524800e15, -2.25179981368524900e15 ]
		},
		'transpose': {
			'info': 4,
			'C': [ -5.62949953421312000e15, -5.62949953421311400e15 ],
			'F': [ 1.12589990684262400e16, 1.12589990684262320e16 ]
		}
	},
	{
		'name': '2x1 (mb=2, nb=1)',
		'M': 2,
		'N': 1,
		'A': [ 1.0, 1.0, 1.0, 1.0 ],
		'D': [ 1.0, 0.0, 0.0, 1.0 ],
		'B': [ 2.0 ],
		'E': [ 1.0 ],
		'C0': [ 1.0, 2.0 ],
		'F0': [ -1.0, 0.5 ],
		'no-transpose': {
			'info': 4,
			'C': [ -4.50359962737049500e15, -4.50359962737049600e15 ],
			'F': [ -4.50359962737049600e15, -4.50359962737049600e15 ]
		},
		'transpose': {
			'info': 4,
			'C': [ -2.81474976710655950e15, -2.81474976710655900e15 ],
			'F': [ 5.62949953421312000e15, 5.62949953421311800e15 ]
		}
	},
	{
		'name': '2x2 (mb=2, nb=2)',
		'M': 2,
		'N': 2,
		'A': [ 1.0, 1.0, 1.0, 1.0 ],
		'D': [ 1.0, 0.0, 0.0, 1.0 ],
		'B': [ 2.0, 2.0, 1.0, 1.0 ],
		'E': [ 1.0, 0.0, 0.0, 1.0 ],
		'C0': [ 1.0, 2.0, 3.0, 4.0 ],
		'F0': [ -1.0, 0.5, 2.0, -3.0 ],
		'no-transpose': {
			'info': 8,
			'C': [ -1.12589990684263500e15, 1.12589990684262400e15, 1.12589990684263000e15, -1.12589990684263300e15 ],
			'F': [ -1.12589990684263400e15, 1.12589990684262350e15, 1.12589990684262800e15, -1.12589990684263000e15 ]
		},
		'transpose': {
			'info': 8,
			'C': [ 7.31834939447705300e15, -7.31834939447705400e15, -1.46366987889541080e16, 1.46366987889541120e16 ],
			'F': [ 2.0, 3.0, 0.0, 0.0 ]
		}
	}
];

test( 'dtgsy2: singular 1x2, 2x1 and 2x2 subsystems return info > 0 and match the reference perturbed solution (both trans)', function t() {
	SINGULAR_CASES.forEach( function eachCase( tc ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const expected = tc[ trans ];
			const msg = tc.name + ' ' + trans;
			const M = tc.M;
			const N = tc.N;
			const C = new Float64Array( tc.C0 );
			const F = new Float64Array( tc.F0 );
			const scale = new Float64Array( 1 );
			const rdsum = new Float64Array( 1 );
			const rdscal = new Float64Array( [ 1.0 ] );
			const IWORK = new Int32Array( M + N + 6 );
			const pq = new Int32Array( 1 );
			const info = dtgsy2( trans, 0, M, N, new Float64Array( tc.A ), 1, M, 0, new Float64Array( tc.B ), 1, N, 0, C, 1, M, 0, new Float64Array( tc.D ), 1, M, 0, new Float64Array( tc.E ), 1, N, 0, F, 1, M, 0, scale, rdsum, rdscal, IWORK, 1, 0, pq ); // eslint-disable-line max-len
			assert.equal( info, expected.info, msg + ': info' );
			assert.equal( scale[ 0 ], 1.0, msg + ': scale' );
			assertArrayClose( C, expected.C, 1e-12, msg + ': C' );
			assertArrayClose( F, expected.F, 1e-12, msg + ': F' );
		});
	});
});
