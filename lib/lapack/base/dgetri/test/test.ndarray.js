/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from '../../dgetrf/lib/base.js';
import dgetri from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Multiply two N-by-N column-major matrices: C = A * B.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} A - first matrix (column-major)
* @param {Float64Array} B - second matrix (column-major)
* @returns {Float64Array} C = A * B (column-major)
*/
function matmul( N, A, B ) {
	const C = new Float64Array( N * N );
	let i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				C[ i + j * N ] += A[ i + k * N ] * B[ k + j * N ];
			}
		}
	}
	return C;
}

/**
* Check that a matrix is approximately the identity.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} C - matrix to check (column-major)
* @param {number} tol - tolerance
* @param {string} msg - error message prefix
*/
function assertIdentity( N, C, tol, msg ) {
	let expected, err, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			expected = ( i === j ) ? 1.0 : 0.0;
			err = Math.abs( C[ i + j * N ] - expected );
			assert.ok( err <= tol, msg + ': C[' + i + ',' + j + '] = ' + C[ i + j * N ] + ', expected ' + expected + ', err = ' + err ); // eslint-disable-line max-len
		}
	}
}


// TESTS //

test( 'dgetri: 3x3 inverse', function t() {
	let info;

	const Aorig = new Float64Array([ 2, 4, 8, 1, 3, 7, 1, 3, 9 ]);
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const WORK = new Float64Array( 64 );
	info = dgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( 3, A, 1, 3, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( 3, Aorig, A );
	assertIdentity( 3, C, 1e-13, 'A * A_inv' );
});

test( 'dgetri: 4x4 inverse', function t() {
	let info;

	const Aorig = new Float64Array([
		5,
		7,
		6,
		5,
		7,
		10,
		8,
		7,
		6,
		8,
		10,
		9,
		5,
		7,
		9,
		10
	]);
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 4 );
	const WORK = new Float64Array( 128 );
	info = dgetrf( 4, 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( 4, A, 1, 4, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( 4, Aorig, A );
	assertIdentity( 4, C, 1e-10, 'A * A_inv' );
});

test( 'dgetri: N=1 edge case', function t() {
	let info;

	const A = new Float64Array([ 4.0 ]);
	const IPIV = new Int32Array( 1 );
	const WORK = new Float64Array( 4 );
	info = dgetrf( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	assert.ok( Math.abs( A[ 0 ] - 0.25 ) < 1e-15, 'A[0] = ' + A[ 0 ] );
});

test( 'dgetri: N=0 quick return', function t() {

	const A = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dgetri( 0, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
});

test( 'dgetri: 3x3 different pivots', function t() {
	let info;

	const Aorig = new Float64Array([ 1, 4, 7, 2, 5, 8, 3, 6, 0 ]);
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 3 );
	const WORK = new Float64Array( 64 );
	info = dgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( 3, A, 1, 3, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( 3, Aorig, A );
	assertIdentity( 3, C, 1e-13, 'A * A_inv' );
});

test( 'dgetri: singular matrix returns info > 0', function t() {
	let info;

	const A = new Float64Array([ 1, 2, 2, 4 ]);
	const IPIV = new Int32Array( 2 );
	const WORK = new Float64Array( 16 );
	info = dgetrf( 2, 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.ok( info > 0, 'dgetrf should detect singular matrix, info=' + info );
	info = dgetri( 2, A, 1, 2, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.ok( info > 0, 'dgetri should return info > 0 for singular matrix, info=' + info ); // eslint-disable-line max-len
});

test( 'dgetri: 5x5 matrix inverse', function t() {
	let info;

	const Aorig = new Float64Array([
		10,
		1,
		2,
		0,
		1,
		1,
		10,
		1,
		2,
		0,
		2,
		1,
		10,
		1,
		2,
		0,
		2,
		1,
		10,
		1,
		1,
		0,
		2,
		1,
		10
	]);
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( 5 );
	const WORK = new Float64Array( 256 );
	info = dgetrf( 5, 5, A, 1, 5, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( 5, A, 1, 5, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( 5, Aorig, A );
	assertIdentity( 5, C, 1e-12, 'A * A_inv' );
});

test( 'dgetri: blocked path (large matrix)', function t() {
	let info, i, j;

	const N = 35;
	const Aorig = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				Aorig[ i + j * N ] = N + 1.0;
			} else {
				Aorig[ i + j * N ] = 1.0 / ( 1.0 + Math.abs( i - j ) );
			}
		}
	}
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( N );
	const WORK = new Float64Array( N * 64 );
	info = dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( N, Aorig, A );
	assertIdentity( N, C, 1e-10, 'A * A_inv' );
});

test( 'dgetri: blocked path with insufficient workspace (lwork < N*NB)', function t() { // eslint-disable-line max-len
	let info, i, j;

	const N = 35;
	const Aorig = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				Aorig[ i + j * N ] = N + 1.0;
			} else {
				Aorig[ i + j * N ] = 1.0 / ( 1.0 + Math.abs( i - j ) );
			}
		}
	}
	const A = new Float64Array( Aorig );
	const IPIV = new Int32Array( N );
	const lwork = 105;
	const WORK = new Float64Array( lwork );
	info = dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf info' );
	info = dgetri( N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'dgetri info' );
	const C = matmul( N, Aorig, A );
	assertIdentity( N, C, 1e-10, 'A * A_inv' );
});
