/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsymv from './../../../../blas/base/dsymv/lib/base.js';
import dsytrf from './../../dsytrf/lib/base.js';
import dsytrs from './../../dsytrs/lib/base.js';
import dsyrfs from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Compute ||A_x - b||_inf / (||A||_inf _ ||x||_inf _ N _ eps).
* Returns the backward error ratio.
*/
function residualCheck( uplo, N, A, x, b ) {
	var normX;
	var maxR;
	var r = new Float64Array( N );
	var i;

	// r = b
	for ( i = 0; i < N; i++ ) {
		r[ i ] = b[ i ];
	}
	// r = A*x - b = -1*A*x + 1*r => r = b - A*x
	dsymv( uplo, N, -1.0, A, 1, N, 0, x, 1, 0, 1.0, r, 1, 0 );

	maxR = 0.0;
	normX = 0.0;
	for ( i = 0; i < N; i++ ) {
		maxR = Math.max( maxR, Math.abs( r[ i ] ) );
		normX = Math.max( normX, Math.abs( x[ i ] ) );
	}
	return maxR / ( normX || 1.0 );
}

/**
* Helper: factorize symmetric matrix, solve, then refine.
*
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - matrix order
* @param {number} nrhs - number of right-hand sides
* @param {Float64Array} A - original symmetric matrix (column-major, N*N)
* @param {Float64Array} b - right-hand side matrix (column-major, N*nrhs)
* @returns {Object} result with info, x, ferr, berr
*/
function solveAndRefine( uplo, N, nrhs, A, b ) {
	var IWORK = new Int32Array( N );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Float64Array( 3 * N );
	var IPIV = new Int32Array( N );
	var info;
	var AF = new Float64Array( N * N );
	var X = new Float64Array( N * nrhs );
	var i;

	for ( i = 0; i < N * N; i++ ) {
		AF[ i ] = A[ i ];
	}
	for ( i = 0; i < N * nrhs; i++ ) {
		X[ i ] = b[ i ];
	}

	info = dsytrf( uplo, N, AF, 1, N, 0, IPIV, 1, 0 );
	if ( info !== 0 ) {
		return {
			'info': info,
			'x': X,
			'ferr': FERR,
			'berr': BERR,
			'factInfo': info
		};
	}

	dsytrs( uplo, N, nrhs, AF, 1, N, 0, IPIV, 1, 0, X, 1, N, 0 );
	info = dsyrfs( uplo, N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, b, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'ferr': FERR,
		'berr': BERR
	};
}


// TESTS //

test( 'dsyrfs: upper_3x3 - single RHS', function t() {
	var result;
	var resid;
	var A;
	var b;

	A = new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		1.0,
		3.0,
		6.0
	]);
	b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	result = solveAndRefine( 'upper', 3, 1, A, b );
	assert.equal( result.info, 0 );
	resid = residualCheck( 'upper', 3, A, result.x, b );
	assert.ok( resid < 1e-14, 'residual should be near machine epsilon, got ' + resid ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be tiny, got ' + result.berr[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsyrfs: lower_3x3 - single RHS', function t() {
	var result;
	var resid;
	var A;
	var b;

	A = new Float64Array([
		4.0,
		2.0,
		1.0,
		0.0,
		5.0,
		3.0,
		0.0,
		0.0,
		6.0
	]);
	b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	result = solveAndRefine( 'lower', 3, 1, A, b );
	assert.equal( result.info, 0 );
	resid = residualCheck( 'lower', 3, A, result.x, b );
	assert.ok( resid < 1e-14, 'residual should be near machine epsilon, got ' + resid ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be tiny, got ' + result.berr[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsyrfs: multi_rhs - two right-hand sides', function t() {
	var result;
	var resid1;
	var resid2;
	var x1;
	var x2;
	var b1;
	var b2;
	var A;
	var b;

	A = new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		1.0,
		3.0,
		6.0
	]);
	b = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
	result = solveAndRefine( 'upper', 3, 2, A, b );
	x1 = new Float64Array( result.x.buffer, 0, 3 );
	x2 = new Float64Array( result.x.buffer, 3 * 8, 3 );
	b1 = new Float64Array([ 1.0, 0.0, 0.0 ]);
	b2 = new Float64Array([ 0.0, 1.0, 0.0 ]);
	assert.equal( result.info, 0 );
	resid1 = residualCheck( 'upper', 3, A, x1, b1 );
	resid2 = residualCheck( 'upper', 3, A, x2, b2 );
	assert.ok( resid1 < 1e-14, 'residual for RHS 1: ' + resid1 );
	assert.ok( resid2 < 1e-14, 'residual for RHS 2: ' + resid2 );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr[0]: ' + result.berr[ 0 ] );
	assert.ok( result.berr[ 1 ] < 1e-13, 'berr[1]: ' + result.berr[ 1 ] );
});

test( 'dsyrfs: N=0 quick return', function t() {
	var IWORK;
	var FERR;
	var BERR;
	var WORK;
	var IPIV;
	var info;
	var AF;
	var A;
	var B;
	var X;

	FERR = new Float64Array([ 999.0 ]);
	BERR = new Float64Array([ 999.0 ]);
	WORK = new Float64Array( 1 );
	IWORK = new Int32Array( 1 );
	A = new Float64Array( 1 );
	AF = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	X = new Float64Array( 1 );
	info = dsyrfs( 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( FERR[ 0 ], 0.0, 'FERR should be zero for N=0' );
	assert.equal( BERR[ 0 ], 0.0, 'BERR should be zero for N=0' );
});

test( 'dsyrfs: NRHS=0 quick return', function t() {
	var IWORK;
	var FERR;
	var BERR;
	var WORK;
	var IPIV;
	var info;
	var AF;
	var A;
	var B;
	var X;

	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	A = new Float64Array( 9 );
	AF = new Float64Array( 9 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( 3 );
	X = new Float64Array( 3 );
	info = dsyrfs( 'upper', 3, 0, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dsyrfs: 1x1 system', function t() {
	var result;
	var A;
	var b;

	A = new Float64Array([ 5.0 ]);
	b = new Float64Array([ 10.0 ]);
	result = solveAndRefine( 'upper', 1, 1, A, b );
	assert.equal( result.info, 0 );
	assert.ok( Math.abs( result.x[ 0 ] - 2.0 ) < 1e-14, 'x should be 2.0, got ' + result.x[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] <= 1e-14, 'berr should be ~0' );
});

test( 'dsyrfs: ill-conditioned Hilbert upper', function t() {
	var result;
	var resid;
	var A;
	var b;

	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		1.0 / 3.0,
		0.0,
		1.0 / 3.0,
		0.25,
		0.2
	]);
	b = new Float64Array([ 1.0, 1.0, 1.0 ]);
	result = solveAndRefine( 'upper', 3, 1, A, b );
	assert.equal( result.info, 0 );
	resid = residualCheck( 'upper', 3, A, result.x, b );
	assert.ok( resid < 1e-10, 'residual for Hilbert matrix: ' + resid );
	assert.ok( result.ferr[ 0 ] < 1e-8, 'ferr should reflect ill-conditioning, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsyrfs: lower with non-trivial pivoting (indefinite matrix)', function t() { // eslint-disable-line max-len
	var result;
	var resid;
	var A;
	var b;

	A = new Float64Array([
		1.0,
		2.0,
		3.0,
		0.0,
		-1.0,
		4.0,
		0.0,
		0.0,
		0.0
	]);
	b = new Float64Array([ 6.0, 5.0, 7.0 ]);
	result = solveAndRefine( 'lower', 3, 1, A, b );
	assert.equal( result.info, 0 );
	resid = residualCheck( 'lower', 3, A, result.x, b );
	assert.ok( resid < 1e-13, 'residual for indefinite matrix: ' + resid );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr: ' + result.berr[ 0 ] );
});

test( 'dsyrfs: perturbed solution triggers iterative refinement', function t() {
	var IWORK;
	var resid;
	var FERR;
	var BERR;
	var WORK;
	var IPIV;
	var info;
	var AF;
	var A;
	var b;
	var X;
	var i;

	A = new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		1.0,
		3.0,
		6.0
	]);
	b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Float64Array( 9 );
	IWORK = new Int32Array( 3 );
	AF = new Float64Array( 9 );
	X = new Float64Array( 3 );
	IPIV = new Int32Array( 3 );
	for ( i = 0; i < 9; i++ ) {
		AF[ i ] = A[ i ];
	}
	info = dsytrf( 'upper', 3, AF, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	X[ 0 ] = b[ 0 ];
	X[ 1 ] = b[ 1 ];
	X[ 2 ] = b[ 2 ];
	dsytrs( 'upper', 3, 1, AF, 1, 3, 0, IPIV, 1, 0, X, 1, 3, 0 );
	X[ 0 ] += 1e-8;
	X[ 1 ] -= 1e-8;
	X[ 2 ] += 1e-8;
	info = dsyrfs( 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, b, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	resid = residualCheck( 'upper', 3, A, X, b );
	assert.ok( resid < 1e-14, 'refinement should recover accurate solution, residual: ' + resid ); // eslint-disable-line max-len
});
