/* eslint-disable no-restricted-syntax, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbsvx from './../lib/ndarray.js';

// FIXTURES //

import nofact_notrans_tridiag from './fixtures/nofact_notrans_tridiag.json' with { type: 'json' };
import nofact_trans_tridiag from './fixtures/nofact_trans_tridiag.json' with { type: 'json' };
import equil_notrans_tridiag from './fixtures/equil_notrans_tridiag.json' with { type: 'json' };
import factored_notrans_tridiag from './fixtures/factored_notrans_tridiag.json' with { type: 'json' };
import nofact_notrans_2rhs from './fixtures/nofact_notrans_2rhs.json' with { type: 'json' };
import nofact_notrans_pentadiag from './fixtures/nofact_notrans_pentadiag.json' with { type: 'json' };
import equil_trans_asymmetric from './fixtures/equil_trans_asymmetric.json' with { type: 'json' };
import singular_matrix from './fixtures/singular_matrix.json' with { type: 'json' };
import pivot_asymmetric from './fixtures/pivot_asymmetric.json' with { type: 'json' };

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
* @param {*} actual - actual array
* @param {*} expected - expected array
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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Creates workspace arrays for dgbsvx.
*
* @private
* @param {NonNegativeInteger} n - matrix order
* @returns {Object} workspace arrays
*/
function makeWork( n ) {
	return {
		'WORK': new Float64Array( 3 * Math.max( 1, n ) ),
		'IWORK': new Int32Array( Math.max( 1, n ) )
	};
}

/**
* Stores a dense matrix into band storage format (column-major).
*
* @private
* @param {Array} dense - dense column-major N-by-N matrix
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @returns {Float64Array} band matrix in band storage (KL+KU+1 by N, col-major)
*/
function denseToGB( dense, N, kl, ku ) {
	let bandRow, i, j;

	const nRows = kl + ku + 1;
	const AB = new Float64Array( nRows * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - ku ); i < Math.min( N, j + kl + 1 ); i++ ) {
			bandRow = ( ku + i ) - j;
			AB[ bandRow + ( j * nRows ) ] = dense[ i + ( j * N ) ];
		}
	}
	return AB;
}

// TESTS //

test( 'dgbsvx: main export is a function', function t() {
	assert.strictEqual( typeof dgbsvx, 'function' );
});

test( 'dgbsvx: fact=not-factored, trans=no-transpose, 4x4 tridiag', function t() { // eslint-disable-line max-len
	const rcond = new Float64Array( 1 );

	const tc = nofact_notrans_tridiag;
	const nrhs = 1;
	const nRows = 3;
	const AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const B = new Float64Array( [ 3, 2, 2, 3 ] );
	const X = new Float64Array( 4 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 4 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( equed[ 0 ], 'none' );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
	assertClose( w.WORK[ 0 ], tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: fact=not-factored, trans=transpose, 4x4 symmetric tridiag', function t() { // eslint-disable-line max-len
	const rcond = new Float64Array( 1 );

	const tc = nofact_trans_tridiag;
	const nrhs = 1;
	const nRows = 3;
	const AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const B = new Float64Array( [ 3, 2, 2, 3 ] );
	const X = new Float64Array( 4 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 4 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=equilibrate, trans=no-transpose, 4x4 tridiag', function t() { // eslint-disable-line max-len
	const rcond = new Float64Array( 1 );

	const tc = equil_notrans_tridiag;
	const nrhs = 1;
	const nRows = 3;
	const AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const B = new Float64Array( [ 3, 2, 2, 3 ] );
	const X = new Float64Array( 4 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 4 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'equilibrate', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
	assert.equal( equed[ 0 ], 'none' );
});

test( 'dgbsvx: fact=factored, reuse LU factorization', function t() {
	const rcond = new Float64Array( 1 );
	const rcondOut = new Float64Array( 1 );
	let FERR, BERR, w, B, X;

	const tc = factored_notrans_tridiag;
	const nrhs = 1;
	const nRows = 3;
	const AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	const equed = [ 'none' ];
	const info1 = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info1, 0 );
	B = new Float64Array( [ 5, 8, 8, 16 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	const equed2 = [ 'none' ];
	const info2 = dgbsvx( 'factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed2, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcondOut, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info2, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcondOut[ 0 ], tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=not-factored, trans=no-transpose, 2 RHS', function t() {
	const rcond = new Float64Array( 1 );

	const tc = nofact_notrans_2rhs;
	const nrhs = 2;
	const nRows = 3;
	const AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const B = new Float64Array( [ 3, 2, 2, 3, 2, 5, 8, 13 ] );
	const X = new Float64Array( 4 * nrhs );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 4 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=not-factored, 5x5 pentadiagonal (KL=2, KU=2)', function t() { // eslint-disable-line max-len
	const rcond = new Float64Array( 1 );

	const tc = nofact_notrans_pentadiag;
	const nrhs = 1;
	const nRows = 5;
	const dense = [
		6,
		-2,
		1,
		0,
		0,
		-2,
		6,
		-2,
		1,
		0,
		1,
		-2,
		6,
		-2,
		1,
		0,
		1,
		-2,
		6,
		-2,
		0,
		0,
		1,
		-2,
		6
	];
	const AB = denseToGB( dense, 5, 2, 2 );
	const AFB = new Float64Array( 7 * 5 );
	const IPIV = new Int32Array( 5 );
	const r = new Float64Array( 5 );
	const c = new Float64Array( 5 );
	const B = new Float64Array( [ 5, 3, 4, 3, 5 ] );
	const X = new Float64Array( 5 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 5 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 5, 2, 2, nrhs, AB, 1, nRows, 0, AFB, 1, 7, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 5, 0, X, 1, 5, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
	assertClose( w.WORK[ 0 ], tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: fact=equilibrate, trans=transpose, asymmetric 4x4', function t() { // eslint-disable-line max-len
	const rcond = new Float64Array( 1 );

	const tc = equil_trans_asymmetric;
	const nrhs = 1;
	const nRows = 3;
	const dense = [
		2,
		1,
		0,
		0,
		3,
		5,
		1,
		0,
		0,
		2,
		4,
		2,
		0,
		0,
		3,
		6
	];
	const AB = denseToGB( dense, 4, 1, 1 );
	const AFB = new Float64Array( 5 * 4 );
	const IPIV = new Int32Array( 4 );
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const B = new Float64Array( [ 4, 16, 24, 33 ] );
	const X = new Float64Array( 4 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 4 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'equilibrate', 'transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: singular matrix returns info > 0', function t() {
	const rcond = new Float64Array( 1 );

	const tc = singular_matrix;
	const nrhs = 1;
	const nRows = 3;
	const AB = denseToGB( [ 2, 0, 0, 0, 0, 0, 0, 0, 3 ], 3, 1, 1 );
	const AFB = new Float64Array( 5 * 3 );
	const IPIV = new Int32Array( 3 );
	const r = new Float64Array( 3 );
	const c = new Float64Array( 3 );
	const B = new Float64Array( [ 1, 2, 3 ] );
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 3 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 3, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( rcond[ 0 ], tc.rcond );
	assertClose( w.WORK[ 0 ], tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: pivoting with asymmetric matrix', function t() {
	const rcond = new Float64Array( 1 );

	const tc = pivot_asymmetric;
	const nrhs = 1;
	const nRows = 3;
	const dense = [ 1, 4, 0, 3, 5, 1, 0, 2, 6 ];
	const AB = denseToGB( dense, 3, 1, 1 );
	const AFB = new Float64Array( 5 * 3 );
	const IPIV = new Int32Array( 3 );
	const r = new Float64Array( 3 );
	const c = new Float64Array( 3 );
	const B = new Float64Array( [ 7, 20, 20 ] );
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( 3 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 3, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: quick return for N=0', function t() {
	const rcond = new Float64Array( 1 );

	const AB = new Float64Array( 1 );
	const AFB = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const w = makeWork( 1 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'not-factored', 'no-transpose', 0, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 1, 0, X, 1, 1, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 1.0 );
	assert.equal( w.WORK[ 0 ], 1.0, 'RPVGRW' );
});

// PROPERTY TESTS (equilibration, transposes, factored reuse) //

/**
* Returns a badly scaled 5-by-5 band matrix (KL=1, KU=2) as a dense column-major array: `A = diag(dr) * M * diag(dc)`.
*
* @private
* @param {Array} dr - row scale factors
* @param {Array} dc - column scale factors
* @returns {Array} dense column-major matrix
*/
function scaledBand( dr, dc ) {
	const M = [
		[ 4, 1, 0.5, 0, 0 ],
		[ 1, 5, 1, 0.3, 0 ],
		[ 0, 1, 6, 1, 0.2 ],
		[ 0, 0, 1, 7, 1 ],
		[ 0, 0, 0, 1, 8 ]
	];
	const out = [];
	let i;
	let j;
	for ( j = 0; j < 5; j++ ) {
		for ( i = 0; i < 5; i++ ) {
			out.push( dr[ i ] * M[ i ][ j ] * dc[ j ] );
		}
	}
	return out;
}

/**
* Computes `op(A)*x` for a dense column-major N-by-N matrix.
*
* @private
* @param {Array} A - dense matrix
* @param {NonNegativeInteger} N - order
* @param {boolean} trans - whether to apply the transpose
* @param {Array} x - vector
* @returns {Array} product
*/
function matvec( A, N, trans, x ) {
	const y = [];
	let s;
	let i;
	let k;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( k = 0; k < N; k++ ) {
			s += ( ( trans ) ? A[ k + ( i * N ) ] : A[ i + ( k * N ) ] ) * x[ k ];
		}
		y.push( s );
	}
	return y;
}

/**
* Returns the infinity norm of a vector.
*
* @private
* @param {Array} v - vector
* @returns {number} norm
*/
function normInf( v ) {
	let m = 0.0;
	let i;
	for ( i = 0; i < v.length; i++ ) {
		m = Math.max( m, Math.abs( v[ i ] ) );
	}
	return m;
}

/**
* Solves `op(A)*X = B` (one right-hand side, `x_true = [1,-2,3,-4,5]`) via `fact = 'equilibrate'` and checks the residual, the FERR bound and the requested equilibration.
*
* @private
* @param {string} trans - transpose option
* @param {Array} dr - row scale factors
* @param {Array} dc - column scale factors
* @param {string} expectedEqued - expected EQUED on output
* @returns {Object} solver outputs
*/
function solveEquilibrated( trans, dr, dc, expectedEqued ) {
	const xtrue = [ 1, -2, 3, -4, 5 ];
	const dense = scaledBand( dr, dc );
	const tr = ( trans !== 'no-transpose' );
	const b = matvec( dense, 5, tr, xtrue );
	const AB = denseToGB( dense, 5, 1, 2 );
	const AFB = new Float64Array( 5 * 5 );
	const IPIV = new Int32Array( 5 );
	const r = new Float64Array( 5 );
	const c = new Float64Array( 5 );
	const B = new Float64Array( b );
	const X = new Float64Array( 5 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const rcond = new Float64Array( 1 );
	const w = makeWork( 5 );
	const equed = [ 'none' ];
	const info = dgbsvx( 'equilibrate', trans, 5, 1, 2, 1, AB, 1, 4, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, r, 1, 0, c, 1, 0, B, 1, 5, 0, X, 1, 5, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	const x = toArray( X );
	const res = matvec( dense, 5, tr, x );
	let i;
	for ( i = 0; i < 5; i++ ) {
		res[ i ] -= b[ i ];
	}
	const err = [];
	for ( i = 0; i < 5; i++ ) {
		err.push( x[ i ] - xtrue[ i ] );
	}
	assert.equal( info, 0, 'info' );
	assert.equal( equed[ 0 ], expectedEqued, 'equed' );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0, 'rcond in (0,1]' );
	assert.ok( BERR[ 0 ] <= 1e-15, 'backward error: ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] < 1e-3, 'FERR is small: ' + FERR[ 0 ] );
	assert.ok( normInf( err ) / normInf( x ) <= FERR[ 0 ], 'FERR bounds the true forward error' ); // eslint-disable-line max-len
	assert.ok( normInf( res ) <= 1e-12 * normInf( b ), 'residual' );
	return {
		'AB': AB,
		'AFB': AFB,
		'IPIV': IPIV,
		'r': r,
		'c': c,
		'equed': equed,
		'X': X,
		'FERR': FERR,
		'BERR': BERR,
		'rcond': rcond,
		'b': b
	};
}

test( 'dgbsvx: equilibrate, no-transpose, row scaling only (EQUED=row)', function t() { // eslint-disable-line max-len
	solveEquilibrated( 'no-transpose', [ 1e-4, 1, 1e4, 1, 1e-2 ], [ 1, 1, 1, 1, 1 ], 'row' ); // eslint-disable-line max-len
});

test( 'dgbsvx: equilibrate, no-transpose, row and column scaling (EQUED=both)', function t() { // eslint-disable-line max-len
	solveEquilibrated( 'no-transpose', [ 1, 1, 1, 1, 1 ], [ 1e-4, 1, 1e4, 1, 1e-2 ], 'both' ); // eslint-disable-line max-len
});

test( 'dgbsvx: equilibrate, transpose, row scaling only (EQUED=row)', function t() { // eslint-disable-line max-len
	solveEquilibrated( 'transpose', [ 1e-4, 1, 1e4, 1, 1e-2 ], [ 1, 1, 1, 1, 1 ], 'row' ); // eslint-disable-line max-len
});

test( 'dgbsvx: equilibrate, conjugate-transpose, row and column scaling (EQUED=both)', function t() { // eslint-disable-line max-len
	solveEquilibrated( 'conjugate-transpose', [ 1e3, 1, 1e-3, 1, 1 ], [ 1e-4, 1, 1e4, 1, 1e-2 ], 'both' ); // eslint-disable-line max-len
});

test( 'dgbsvx: fact=factored with user-supplied scaling (EQUED=row, column, both) for each trans', function t() { // eslint-disable-line max-len
	const xtrue = [ 1, -2, 3, -4, 5 ];
	const rs = [ 1e-3, 1, 1e3, 1, 1e-2 ];
	const cs = [ 1e2, 1, 1e-3, 1, 1e1 ];
	const ones = [ 1, 1, 1, 1, 1 ];
	const transes = [ 'no-transpose', 'transpose' ];
	const cases = [ 'row', 'column', 'both' ];
	let dense0;
	let FERR;
	let BERR;
	let rcond;
	let equed;
	let dense;
	let info;
	let AFB;
	let IPIV;
	let err;
	let tr;
	let AB;
	let dr;
	let dc;
	let b;
	let x;
	let w;
	let B;
	let X;
	let i;
	let k;
	let m;
	for ( m = 0; m < transes.length; m++ ) {
		tr = ( transes[ m ] !== 'no-transpose' );
		for ( k = 0; k < cases.length; k++ ) {
			dr = ( cases[ k ] === 'column' ) ? ones : rs;
			dc = ( cases[ k ] === 'row' ) ? ones : cs;

			// Original system op(A)*x = b with A = M:
			dense0 = scaledBand( ones, ones );
			b = matvec( dense0, 5, tr, xtrue );

			// Equilibrated matrix diag(dr)*A*diag(dc), factored with fact='not-factored':
			dense = scaledBand( dr, dc );
			AB = denseToGB( dense, 5, 1, 2 );
			AFB = new Float64Array( 5 * 5 );
			IPIV = new Int32Array( 5 );
			w = makeWork( 5 );
			info = dgbsvx( 'not-factored', transes[ m ], 5, 1, 2, 1, AB, 1, 4, 0, AFB, 1, 5, 0, IPIV, 1, 0, [ 'none' ], new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 5, 0, new Float64Array( 5 ), 1, 5, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
			assert.equal( info, 0 );

			// Solve the original system from the scaled factorization:
			B = new Float64Array( b );
			X = new Float64Array( 5 );
			FERR = new Float64Array( 1 );
			BERR = new Float64Array( 1 );
			rcond = new Float64Array( 1 );
			equed = [ cases[ k ] ];
			w = makeWork( 5 );
			info = dgbsvx( 'factored', transes[ m ], 5, 1, 2, 1, AB, 1, 4, 0, AFB, 1, 5, 0, IPIV, 1, 0, equed, new Float64Array( dr ), 1, 0, new Float64Array( dc ), 1, 0, B, 1, 5, 0, X, 1, 5, 0, rcond, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
			assert.equal( info, 0, cases[ k ] + ': info' );
			assert.equal( equed[ 0 ], cases[ k ], 'equed is unchanged' );
			x = toArray( X );
			err = [];
			for ( i = 0; i < 5; i++ ) {
				err.push( x[ i ] - xtrue[ i ] );
			}
			assert.ok( normInf( err ) / normInf( xtrue ) <= 1e-12, transes[ m ] + '/' + cases[ k ] + ': x solves the original system' ); // eslint-disable-line max-len
			assert.ok( Number.isFinite( FERR[ 0 ] ) && FERR[ 0 ] < 1.0, transes[ m ] + '/' + cases[ k ] + ': FERR is finite: ' + FERR[ 0 ] ); // eslint-disable-line max-len
			assert.ok( normInf( err ) / normInf( x ) <= FERR[ 0 ], 'FERR bounds the true forward error' ); // eslint-disable-line max-len
			assert.ok( BERR[ 0 ] <= 1e-15, 'BERR' );
		}
	}
});

test( 'dgbsvx: N=0 sets RCOND=1, RPVGRW=1 and zero error bounds (no quick return in the reference)', function t() { // eslint-disable-line max-len
	const FERR = new Float64Array( [ -1, -1 ] );
	const BERR = new Float64Array( [ -1, -1 ] );
	const rcond = new Float64Array( [ -1 ] );
	const WORK = new Float64Array( [ -1, -1, -1 ] );
	const info = dgbsvx( 'equilibrate', 'no-transpose', 0, 0, 0, 2, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, [ 'row' ], new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 1, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, new Int32Array( 1 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 1.0 );
	assert.equal( WORK[ 0 ], 1.0, 'RPVGRW' );
	assert.deepEqual( toArray( FERR ), [ 0, 0 ], 'FERR' );
	assert.deepEqual( toArray( BERR ), [ 0, 0 ], 'BERR' );
});

test( 'dgbsvx: NRHS=0 still factors A and estimates RCOND (no quick return in the reference)', function t() { // eslint-disable-line max-len
	const dense = scaledBand( [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1 ] );
	const AB = denseToGB( dense, 5, 1, 2 );
	const AFB = new Float64Array( 5 * 5 );
	const IPIV = new Int32Array( 5 );
	const rcond = new Float64Array( 1 );
	const w = makeWork( 5 );
	const rc = new Float64Array( 1 );
	const w2 = makeWork( 5 );
	let info = dgbsvx( 'not-factored', 'no-transpose', 5, 1, 2, 0, AB, 1, 4, 0, AFB, 1, 5, 0, IPIV, 1, 0, [ 'none' ], new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 5, 0, new Float64Array( 5 ), 1, 5, 0, rcond, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.deepEqual( toArray( IPIV ), [ 0, 1, 2, 3, 4 ], 'IPIV (0-based, no pivoting for a diagonally dominant matrix)' ); // eslint-disable-line max-len
	assert.equal( AFB[ 3 ], 4.0, 'AFB holds U(1,1)' );

	// RCOND must match a solve with one right-hand side:
	info = dgbsvx( 'not-factored', 'no-transpose', 5, 1, 2, 1, denseToGB( dense, 5, 1, 2 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Int32Array( 5 ), 1, 0, [ 'none' ], new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 5 ), 1, 5, 0, new Float64Array( 5 ), 1, 5, 0, rc, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, w2.WORK, 1, 0, w2.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], rc[ 0 ], 'rcond' );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] < 1.0, 'rcond' );
	assert.equal( w.WORK[ 0 ], w2.WORK[ 0 ], 'RPVGRW' );
});
