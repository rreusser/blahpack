/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgels from './../lib/ndarray.js';
const ndarrayFn = dgels;

// FIXTURES //

import overdetermined_4x2 from './fixtures/overdetermined_4x2.json' with { type: 'json' };
import underdetermined_2x4 from './fixtures/underdetermined_2x4.json' with { type: 'json' };
import square_3x3 from './fixtures/square_3x3.json' with { type: 'json' };
import transpose_mlt_n_ls from './fixtures/transpose_mlt_n_ls.json' with { type: 'json' };
import transpose_mge_n_minnorm from './fixtures/transpose_mge_n_minnorm.json' with { type: 'json' };
import multi_rhs_overdetermined from './fixtures/multi_rhs_overdetermined.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import overdetermined_6x3 from './fixtures/overdetermined_6x3.json' with { type: 'json' };

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
* Extracts a sub-vector from a column-major matrix B stored as Float64Array.
*
* @param {Float64Array} B - matrix stored in column-major order
* @param {integer} LDB - leading dimension of B
* @param {integer} col - column index (0-based)
* @param {integer} len - number of rows to extract
* @returns {Array} extracted values
*/
function extractCol( B, LDB, col, len ) {
	const result = [];
	let i;
	for ( i = 0; i < len; i++ ) {
		result.push( B[ col * LDB + i ] );
	}
	return result;
}

// TESTS //

test( 'dgels: overdetermined 4x2, TRANS=N (least squares)', function t() {

	const tc = overdetermined_4x2;
	const A = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const B = new Float64Array([
		1.0, 2.0, 4.0, 3.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1] ], tc.x, 1e-14, 'x' );
});

test( 'dgels: underdetermined 2x4, TRANS=N (minimum norm)', function t() {

	const tc = underdetermined_2x4;
	const A = new Float64Array([
		1.0,
		5.0,
		2.0,
		6.0,
		3.0,
		7.0,
		4.0,
		8.0
	]);
	const B = new Float64Array([
		10.0, 26.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1], B[2], B[3] ], tc.x, 1e-14, 'x' );
});

test( 'dgels: square 3x3, TRANS=N', function t() {

	const tc = square_3x3;
	const A = new Float64Array([
		5.0,
		1.0,
		1.0,
		1.0,
		5.0,
		1.0,
		1.0,
		1.0,
		5.0
	]);
	const B = new Float64Array([
		7.0, 7.0, 7.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1], B[2] ], tc.x, 1e-14, 'x' );
});

test( 'dgels: TRANS=T, M < N (least squares of A^T * x = b)', function t() {

	const tc = transpose_mlt_n_ls;
	const A = new Float64Array([
		1.0,
		5.0,
		2.0,
		6.0,
		3.0,
		7.0,
		4.0,
		8.0
	]);
	const B = new Float64Array([
		1.0, 2.0, 4.0, 3.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'transpose', 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1] ], tc.x, 1e-14, 'x' );
});

test( 'dgels: TRANS=T, M >= N (minimum norm of A^T * x = b)', function t() {

	const tc = transpose_mge_n_minnorm;
	const A = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const B = new Float64Array([
		10.0, 30.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1], B[2], B[3] ], tc.x, 1e-14, 'x' );
});

test( 'dgels: multiple RHS, overdetermined 4x2', function t() {

	const tc = multi_rhs_overdetermined;
	const A = new Float64Array([
		2.0,
		0.0,
		1.0,
		1.0,
		1.0,
		2.0,
		1.0,
		0.0
	]);
	const B = new Float64Array([
		3.0,
		2.0,
		2.0,
		1.0,
		5.0,
		4.0,
		3.0,
		2.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 4, 2, 2, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( extractCol( B, 4, 0, 2 ), tc.x1, 1e-14, 'x1' );
	assertArrayClose( extractCol( B, 4, 1, 2 ), tc.x2, 1e-14, 'x2' );
});

test( 'dgels: N=0 quick return', function t() {

	const tc = n_zero;
	const A = new Float64Array( [ 1.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0 ] );
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 3, 0, 1, A, 1, 3, 0, B, 1, 3, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( B[0], 0.0, 'B[0] zeroed' );
	assert.equal( B[1], 0.0, 'B[1] zeroed' );
	assert.equal( B[2], 0.0, 'B[2] zeroed' );
});

test( 'dgels: M=0 quick return', function t() {

	const tc = m_zero;
	const A = new Float64Array( [ 1.0 ] );
	const B = new Float64Array( [ 1.0, 0.0, 0.0 ] );
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 0, 3, 1, A, 1, 1, 0, B, 1, 3, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( B[0], 0.0, 'B[0] zeroed' );
	assert.equal( B[1], 0.0, 'B[1] zeroed' );
	assert.equal( B[2], 0.0, 'B[2] zeroed' );
});

test( 'dgels: NRHS=0 quick return', function t() {

	const tc = nrhs_zero;
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( 1 );
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 2, 2, 0, A, 1, 2, 0, B, 1, 2, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgels: larger overdetermined 6x3', function t() {

	const tc = overdetermined_6x3;
	const A = new Float64Array([
		10.0,
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,   // column 1
		1.0,
		10.0,
		1.0,
		1.0,
		1.0,
		1.0,    // column 2
		1.0,
		1.0,
		10.0,
		1.0,
		1.0,
		1.0     // column 3
	]);
	const B = new Float64Array([
		15.0, 24.0, 33.0, 6.0, 6.0, 6.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 6, 3, 1, A, 1, 6, 0, B, 1, 6, 0, work, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ B[0], B[1], B[2] ], tc.x, 1e-13, 'x' );
});

test( 'dgels: mathematical property - normal equations for overdetermined', function t() { // eslint-disable-line max-len
	let i, j;

	const M = 4;
	const N = 2;
	const Acopy = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const A = new Float64Array( Acopy );
	const B = new Float64Array([
		1.0, 2.0, 4.0, 3.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', M, N, 1, A, 1, M, 0, B, 1, M, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	const r = new Float64Array( M );
	const bOrig = [ 1.0, 2.0, 4.0, 3.0 ];
	const x = [ B[0], B[1] ];
	for ( i = 0; i < M; i++ ) {
		r[i] = bOrig[i];
		for ( j = 0; j < N; j++ ) {
			r[i] -= Acopy[ j * M + i ] * x[j];
		}
	}
	const AtR = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			AtR[j] += Acopy[ j * M + i ] * r[i];
		}
	}
	for ( j = 0; j < N; j++ ) {
		assert.ok( Math.abs( AtR[j] ) < 1e-12, 'Normal equation residual A^T*r[' + j + '] = ' + AtR[j] + ' should be ~0' );
	}
});

test( 'dgels: mathematical property - minimum norm for underdetermined', function t() { // eslint-disable-line max-len
	let i, j;

	const M = 2;
	const N = 4;
	const Acopy = new Float64Array([
		1.0,
		5.0,
		2.0,
		6.0,
		3.0,
		7.0,
		4.0,
		8.0
	]);
	const A = new Float64Array( Acopy );
	const B = new Float64Array([
		10.0, 26.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', M, N, 1, A, 1, M, 0, B, 1, N, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	const bOrig = [ 10.0, 26.0 ];
	const Ax = new Float64Array( M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Ax[i] += Acopy[ j * M + i ] * B[j];
		}
	}
	for ( i = 0; i < M; i++ ) {
		assertClose( Ax[i], bOrig[i], 1e-13, 'A*x[' + i + ']' );
	}
});

test( 'dgels: matrix with exact zero diagonal in R returns info > 0', function t() { // eslint-disable-line max-len

	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0
	]);
	const B = new Float64Array([
		1.0, 1.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, work, 1, 0 );
	assert.ok( info > 0, 'info should be > 0 for matrix with zero on diagonal, got ' + info ); // eslint-disable-line max-len
});

test( 'dgels: all-zero A returns zero solution', function t() {

	const A = new Float64Array( 4 );
	const B = new Float64Array([ 1.0, 2.0 ]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( B[0], 0.0, 'B[0] zeroed for all-zero A' );
	assert.equal( B[1], 0.0, 'B[1] zeroed for all-zero A' );
});

test( 'dgels: tiny A triggers upscaling (iascl=1)', function t() {

	const tc = overdetermined_4x2;
	const scale = 1e-300;
	const A = new Float64Array([
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		2.0 * scale,
		3.0 * scale,
		4.0 * scale
	]);
	const B = new Float64Array([
		1.0 * scale, 2.0 * scale, 4.0 * scale, 3.0 * scale
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( [ B[0], B[1] ], tc.x, 1e-12, 'x' );
});

test( 'dgels: huge A triggers downscaling (iascl=2)', function t() {

	const tc = overdetermined_4x2;
	const scale = 1e300;
	const A = new Float64Array([
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		1.0 * scale,
		2.0 * scale,
		3.0 * scale,
		4.0 * scale
	]);
	const B = new Float64Array([
		1.0 * scale, 2.0 * scale, 4.0 * scale, 3.0 * scale
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( [ B[0], B[1] ], tc.x, 1e-12, 'x' );
});

test( 'dgels: tiny B triggers upscaling (ibscl=1)', function t() {
	let i, j;

	const M = 4;
	const N = 2;
	const scale = 1e-300;
	const Acopy = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const A = new Float64Array( Acopy );
	const bOrig = [ 1.0 * scale, 2.0 * scale, 4.0 * scale, 3.0 * scale ];
	const B = new Float64Array( bOrig );
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', M, N, 1, A, 1, M, 0, B, 1, M, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	const x = [ B[0], B[1] ];
	const r = new Float64Array( M );
	for ( i = 0; i < M; i++ ) {
		r[i] = bOrig[i];
		for ( j = 0; j < N; j++ ) {
			r[i] -= Acopy[ j * M + i ] * x[j];
		}
	}
	const AtR = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			AtR[j] += Acopy[ j * M + i ] * r[i];
		}
	}
	for ( j = 0; j < N; j++ ) {
		assert.ok( Math.abs( AtR[j] ) < 1e-10 * scale, 'Normal equation A^T*r[' + j + '] = ' + AtR[j] + ' should be ~0' );
	}
});

test( 'dgels: huge B triggers downscaling (ibscl=2)', function t() {
	let i, j;

	const M = 4;
	const N = 2;
	const scale = 1e300;
	const Acopy = new Float64Array([
		1.0,
		1.0,
		1.0,
		1.0,
		1.0,
		2.0,
		3.0,
		4.0
	]);
	const A = new Float64Array( Acopy );
	const bOrig = [ 1.0 * scale, 2.0 * scale, 4.0 * scale, 3.0 * scale ];
	const B = new Float64Array( bOrig );
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', M, N, 1, A, 1, M, 0, B, 1, M, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
	const x = [ B[0], B[1] ];
	const r = new Float64Array( M );
	for ( i = 0; i < M; i++ ) {
		r[i] = bOrig[i];
		for ( j = 0; j < N; j++ ) {
			r[i] -= Acopy[ j * M + i ] * x[j];
		}
	}
	const AtR = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			AtR[j] += Acopy[ j * M + i ] * r[i];
		}
	}
	for ( j = 0; j < N; j++ ) {
		assert.ok( Math.abs( AtR[j] ) < 1e-10 * scale, 'Normal equation A^T*r[' + j + '] = ' + AtR[j] + ' should be ~0' );
	}
});

test( 'dgels: singular in underdetermined TRANS=N returns info > 0', function t() { // eslint-disable-line max-len

	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	const B = new Float64Array([
		1.0, 1.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'no-transpose', 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, work, 1, 0 );
	assert.ok( info > 0, 'info should be > 0 for singular L in underdetermined, got ' + info ); // eslint-disable-line max-len
});

test( 'dgels: singular in TRANS=T M>=N (dtrtrs on R^T) returns info > 0', function t() { // eslint-disable-line max-len

	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	const B = new Float64Array([
		1.0, 1.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, work, 1, 0 );
	assert.ok( info > 0, 'info should be > 0 for singular R in TRANS=T M>=N, got ' + info ); // eslint-disable-line max-len
});

test( 'dgels: singular in TRANS=T M<N (dtrtrs on L^T) returns info > 0', function t() { // eslint-disable-line max-len

	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	const B = new Float64Array([
		1.0, 1.0, 0.0, 0.0
	]);
	const work = new Float64Array( 1024 );
	const info = dgels( 'transpose', 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, work, 1, 0 );
	assert.ok( info > 0, 'info should be > 0 for singular L in TRANS=T M<N, got ' + info ); // eslint-disable-line max-len
});

// ndarray validation tests

test( 'dgels: ndarray throws TypeError for invalid trans', function t() {
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 1.0 ] );
	assert.throws( function throws() {
		ndarrayFn( 'invalid', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0 );
	}, TypeError );
});

test( 'dgels: ndarray throws RangeError for negative M', function t() {
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 1.0 ] );
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', -1, 2, 1, A, 1, 2, 0, B, 1, 2, 0 );
	}, RangeError );
});

test( 'dgels: ndarray throws RangeError for negative N', function t() {
	const A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const B = new Float64Array( [ 1.0, 1.0 ] );
	assert.throws( function throws() {
		ndarrayFn( 'no-transpose', 2, -1, 1, A, 1, 2, 0, B, 1, 2, 0 );
	}, RangeError );
});
