/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dspmv from './../../../../blas/base/dspmv/lib/base.js';
import dsptrf from './../../dsptrf/lib/base.js';
import dsptrs from './../../dsptrs/lib/base.js';
import dsprfs from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Compute ||A*x - b||_inf / (||x||_inf || 1) for symmetric packed A.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - matrix order
* @param {Float64Array} AP - packed symmetric matrix
* @param {Float64Array} x - solution vector
* @param {Float64Array} b - right-hand side vector
* @returns {number} backward error ratio
*/
function residualCheck( uplo, N, AP, x, b ) {
	let normX, maxR;
	const r = new Float64Array( N );
	let i;

	// r = b
	for ( i = 0; i < N; i++ ) {
		r[ i ] = b[ i ];
	}
	// r = b - A*x using dspmv: r := -1*A*x + 1*r
	dspmv( uplo, N, -1.0, AP, 1, 0, x, 1, 0, 1.0, r, 1, 0 );

	maxR = 0.0;
	normX = 0.0;
	for ( i = 0; i < N; i++ ) {
		maxR = Math.max( maxR, Math.abs( r[ i ] ) );
		normX = Math.max( normX, Math.abs( x[ i ] ) );
	}
	return maxR / ( normX || 1.0 );
}

/**
* Helper: factorize symmetric packed matrix, solve, then refine.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - matrix order
* @param {number} nrhs - number of right-hand sides
* @param {Float64Array} AP - original symmetric packed matrix, length N*(N+1)/2
* @param {Float64Array} b - right-hand side matrix (column-major, N*nrhs)
* @returns {Object} result with info, x, ferr, berr
*/
function solveAndRefine( uplo, N, nrhs, AP, b ) {
	const IWORK = new Int32Array( N );
	const plen = ( N * ( N + 1 ) ) / 2;
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Float64Array( 3 * N );
	const IPIV = new Int32Array( N );
	let info;
	const AFP = new Float64Array( plen );
	const X = new Float64Array( N * nrhs );
	let i;

	for ( i = 0; i < plen; i++ ) {
		AFP[ i ] = AP[ i ];
	}
	for ( i = 0; i < N * nrhs; i++ ) {
		X[ i ] = b[ i ];
	}

	info = dsptrf( uplo, N, AFP, 1, 0, IPIV, 1, 0 );
	if ( info !== 0 ) {
		return {
			'info': info,
			'x': X,
			'ferr': FERR,
			'berr': BERR,
			'factInfo': info
		};
	}

	dsptrs( uplo, N, nrhs, AFP, 1, 0, IPIV, 1, 0, X, 1, N, 0 );
	info = dsprfs( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, b, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'ferr': FERR,
		'berr': BERR
	};
}


// TESTS //

test( 'dsprfs: upper_3x3 - single RHS', function t() {

	const AP = new Float64Array([ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ]);
	const b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const result = solveAndRefine( 'upper', 3, 1, AP, b );
	assert.equal( result.info, 0 );
	const resid = residualCheck( 'upper', 3, AP, result.x, b );
	assert.ok( resid < 1e-14, 'residual should be near machine epsilon, got ' + resid ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be tiny, got ' + result.berr[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsprfs: lower_3x3 - single RHS', function t() {

	const AP = new Float64Array([ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ]);
	const b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const result = solveAndRefine( 'lower', 3, 1, AP, b );
	assert.equal( result.info, 0 );
	const resid = residualCheck( 'lower', 3, AP, result.x, b );
	assert.ok( resid < 1e-14, 'residual should be near machine epsilon, got ' + resid ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr should be tiny, got ' + result.berr[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.ferr[ 0 ] < 1e-12, 'ferr should be small, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsprfs: multi_rhs - two right-hand sides', function t() {

	const AP = new Float64Array([ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ]);
	const b = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
	const result = solveAndRefine( 'upper', 3, 2, AP, b );
	const x1 = new Float64Array( result.x.buffer, 0, 3 );
	const x2 = new Float64Array( result.x.buffer, 3 * 8, 3 );
	const b1 = new Float64Array([ 1.0, 0.0, 0.0 ]);
	const b2 = new Float64Array([ 0.0, 1.0, 0.0 ]);
	assert.equal( result.info, 0 );
	const resid1 = residualCheck( 'upper', 3, AP, x1, b1 );
	const resid2 = residualCheck( 'upper', 3, AP, x2, b2 );
	assert.ok( resid1 < 1e-14, 'residual for RHS 1: ' + resid1 );
	assert.ok( resid2 < 1e-14, 'residual for RHS 2: ' + resid2 );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr[0]: ' + result.berr[ 0 ] );
	assert.ok( result.berr[ 1 ] < 1e-13, 'berr[1]: ' + result.berr[ 1 ] );
});

test( 'dsprfs: N=0 quick return', function t() {

	const FERR = new Float64Array([ 999.0 ]);
	const BERR = new Float64Array([ 999.0 ]);
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 1 );
	const AP = new Float64Array( 1 );
	const AFP = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const info = dsprfs( 'upper', 0, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( FERR[ 0 ], 0.0, 'FERR should be zero for N=0' );
	assert.equal( BERR[ 0 ], 0.0, 'BERR should be zero for N=0' );
});

test( 'dsprfs: NRHS=0 quick return', function t() {

	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const AP = new Float64Array( 6 );
	const AFP = new Float64Array( 6 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( 3 );
	const X = new Float64Array( 3 );
	const info = dsprfs( 'upper', 3, 0, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dsprfs: 1x1 system', function t() {

	const AP = new Float64Array([ 5.0 ]);
	const b = new Float64Array([ 10.0 ]);
	const result = solveAndRefine( 'upper', 1, 1, AP, b );
	assert.equal( result.info, 0 );
	assert.ok( Math.abs( result.x[ 0 ] - 2.0 ) < 1e-14, 'x should be 2.0, got ' + result.x[ 0 ] ); // eslint-disable-line max-len
	assert.ok( result.berr[ 0 ] <= 1e-14, 'berr should be ~0' );
});

test( 'dsprfs: ill-conditioned Hilbert upper', function t() {

	const AP = new Float64Array([ 1.0, 0.5, 1.0 / 3.0, 1.0 / 3.0, 0.25, 0.2 ]);
	const b = new Float64Array([ 1.0, 1.0, 1.0 ]);
	const result = solveAndRefine( 'upper', 3, 1, AP, b );
	assert.equal( result.info, 0 );
	const resid = residualCheck( 'upper', 3, AP, result.x, b );
	assert.ok( resid < 1e-10, 'residual for Hilbert matrix: ' + resid );
	assert.ok( result.ferr[ 0 ] < 1e-8, 'ferr should reflect ill-conditioning, got ' + result.ferr[ 0 ] ); // eslint-disable-line max-len
});

test( 'dsprfs: lower with indefinite matrix', function t() {

	const AP = new Float64Array([ 1.0, 2.0, 3.0, -1.0, 4.0, 0.0 ]);
	const b = new Float64Array([ 6.0, 5.0, 7.0 ]);
	const result = solveAndRefine( 'lower', 3, 1, AP, b );
	assert.equal( result.info, 0 );
	const resid = residualCheck( 'lower', 3, AP, result.x, b );
	assert.ok( resid < 1e-13, 'residual for indefinite matrix: ' + resid );
	assert.ok( result.berr[ 0 ] < 1e-13, 'berr: ' + result.berr[ 0 ] );
});

test( 'dsprfs: perturbed solution triggers iterative refinement', function t() {
	let info, i;

	const AP = new Float64Array([ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ]);
	const b = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 9 );
	const IWORK = new Int32Array( 3 );
	const AFP = new Float64Array( 6 );
	const X = new Float64Array( 3 );
	const IPIV = new Int32Array( 3 );
	for ( i = 0; i < 6; i++ ) {
		AFP[ i ] = AP[ i ];
	}
	info = dsptrf( 'upper', 3, AFP, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
	X[ 0 ] = b[ 0 ];
	X[ 1 ] = b[ 1 ];
	X[ 2 ] = b[ 2 ];
	dsptrs( 'upper', 3, 1, AFP, 1, 0, IPIV, 1, 0, X, 1, 3, 0 );
	X[ 0 ] += 1e-8;
	X[ 1 ] -= 1e-8;
	X[ 2 ] += 1e-8;
	info = dsprfs( 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, b, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const resid = residualCheck( 'upper', 3, AP, X, b );
	assert.ok( resid < 1e-14, 'refinement should recover accurate solution, residual: ' + resid ); // eslint-disable-line max-len
});
