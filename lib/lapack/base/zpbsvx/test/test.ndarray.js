/* eslint-disable no-restricted-syntax, max-lines, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbtrf from '../../zpbtrf/lib/base.js';
import zpbsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import fact_e_upper from './fixtures/fact_e_upper.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };
import not_pos_def from './fixtures/not_pos_def.json' with { type: 'json' };
import fact_e_multi_rhs from './fixtures/fact_e_multi_rhs.json' with { type: 'json' };
import n4_upper_kd2 from './fixtures/n4_upper_kd2.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
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
* Helper: call zpbsvx with band storage arrays.
*
* @private
* @param {string} fact - factorization type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Complex128Array} AB - original band matrix
* @param {Complex128Array} AFB - factored band matrix
* @param {string} equedVal - initial equed value
* @param {Float64Array} S - scaling factors
* @param {Complex128Array} B - RHS matrix
* @returns {Object} result
*/
function callZpbsvx( fact, uplo, N, kd, nrhs, AB, AFB, equedVal, S, B ) {

	const equed = [ equedVal ];
	const rcond = new Float64Array( 1 );
	const ldab = kd + 1;
	const FERR = new Float64Array( Math.max( 1, nrhs ) );
	const BERR = new Float64Array( Math.max( 1, nrhs ) );
	const WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	const RWORK = new Float64Array( Math.max( 1, N ) );
	const X = new Complex128Array( Math.max( 1, N * nrhs ) );
	const Xv = reinterpret( X, 0 );
	const AFBv = reinterpret( AFB, 0 );

	const info = zpbsvx( fact, uplo, N, kd, nrhs, AB, 1, ldab, 0, AFB, 1, ldab, 0, equed, S, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': toArray( Xv ),
		'rcond': rcond[ 0 ],
		'ferr': toArray( FERR ),
		'berr': toArray( BERR ),
		'afb': toArray( AFBv ),
		's': toArray( S ),
		'equed': equed[ 0 ]
	};
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

// TESTS //

test( 'zpbsvx: fact_n_upper', function t() {

	const tc = fact_n_upper;

	// Upper band KD=1: (*, 4), (-1+0.5i, 4), (-1+0.5i, 4)
	const AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	const res = callZpbsvx( 'not-factored', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_n_lower', function t() {

	const tc = fact_n_lower;

	// Lower band KD=1: (4, -1-0.5i), (4, -1-0.5i), (4, 0)
	const AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	const res = callZpbsvx( 'not-factored', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_f_upper', function t() {

	const tc = fact_f_upper;
	const AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( AB );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	zpbtrf( 'upper', 3, 1, AFB, 1, 2, 0 );
	const res = callZpbsvx( 'factored', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: fact_f_lower', function t() {

	const tc = fact_f_lower;
	const AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( AB );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	zpbtrf( 'lower', 3, 1, AFB, 1, 2, 0 );
	const res = callZpbsvx( 'factored', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: n_zero', function t() {

	const tc = n_zero;
	const AB = new Complex128Array( 1 );
	const AFB = new Complex128Array( 1 );
	const S = new Float64Array( 1 );
	const B = new Complex128Array( 1 );
	const res = callZpbsvx( 'not-factored', 'upper', 0, 0, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
});

test( 'zpbsvx: n_one_upper', function t() {

	const tc = n_one_upper;
	const AB = new Complex128Array( [ 4, 0 ] );
	const AFB = new Complex128Array( 1 );
	const S = new Float64Array( 1 );
	const B = new Complex128Array( [ 8, 4 ] );
	const res = callZpbsvx( 'not-factored', 'upper', 1, 0, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: fact_e_upper', function t() {

	const tc = fact_e_upper;
	const AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	const res = callZpbsvx( 'equilibrate', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_e_lower', function t() {

	const tc = fact_e_lower;
	const AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	const res = callZpbsvx( 'equilibrate', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: multi_rhs', function t() {

	const tc = multi_rhs;
	const AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	const res = callZpbsvx( 'not-factored', 'upper', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: multi_rhs_lower', function t() {

	const tc = multi_rhs_lower;
	const AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	const res = callZpbsvx( 'not-factored', 'lower', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: not_pos_def', function t() {

	const tc = not_pos_def;

	// Upper band KD=1: (*, 1), (2+i, 1)
	const AB = new Complex128Array( [ 0, 0, 1, 0, 2, 1, 1, 0 ] );
	const AFB = new Complex128Array( 4 );
	const S = new Float64Array( 2 );
	const B = new Complex128Array( [ 1, 0, 1, 0 ] );
	const res = callZpbsvx( 'not-factored', 'upper', 2, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'zpbsvx: fact_e_multi_rhs', function t() {

	const tc = fact_e_multi_rhs;
	const AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 6 );
	const S = new Float64Array( 3 );
	const B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	const res = callZpbsvx( 'equilibrate', 'upper', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: n4_upper_kd2', function t() {

	const tc = n4_upper_kd2;

	// Upper band KD=2, N=4, LDAB=3: 3*4=12 complex elements
	const AB = new Complex128Array( [ 0, 0, 0, 0, 6, 0, 0, 0, -0.5, -0.5, 6, 0, 0.25, 0, -0.5, -0.5, 6, 0, 0.25, 0, -0.5, -0.5, 6, 0 ] ); // eslint-disable-line max-len
	const AFB = new Complex128Array( 12 );
	const S = new Float64Array( 4 );
	const B = new Complex128Array( [ 1, 2, 2, -1, 3, 0, 4, 1 ] );
	const res = callZpbsvx( 'not-factored', 'upper', 4, 2, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

// PROPERTY TESTS (equilibration, factored reuse, N=0, ill-conditioned) //

/**
* Returns the badly scaled 4-by-4 Hermitian positive definite tridiagonal matrix `A = D*M*D` as an array of rows of `[re, im]` pairs.
*
* @private
* @param {Array} d - diagonal scaling
* @returns {Array} dense matrix
*/
function scaledHPD( d ) {
	const diag = [ 4, 5, 6, 7 ];
	const off = [ [ 1, 0.5 ], [ -1, 1 ], [ 0.5, -0.5 ] ];
	const A = [];
	let i;
	let j;
	for ( i = 0; i < 4; i++ ) {
		A.push( [] );
		for ( j = 0; j < 4; j++ ) {
			A[ i ].push( [ 0, 0 ] );
		}
	}
	for ( i = 0; i < 4; i++ ) {
		A[ i ][ i ] = [ d[ i ] * diag[ i ] * d[ i ], 0 ];
		if ( i < 3 ) {
			A[ i ][ i + 1 ] = [ d[ i ] * off[ i ][ 0 ] * d[ i + 1 ], d[ i ] * off[ i ][ 1 ] * d[ i + 1 ] ]; // eslint-disable-line max-len
			A[ i + 1 ][ i ] = [ A[ i ][ i + 1 ][ 0 ], -A[ i ][ i + 1 ][ 1 ] ];
		}
	}
	return A;
}

/**
* Packs a dense Hermitian matrix into band storage (KD=1, LDAB=2).
*
* @private
* @param {Array} A - dense matrix
* @param {string} uplo - triangle
* @returns {Complex128Array} band matrix
*/
function toBand( A, uplo ) {
	const AB = new Complex128Array( 8 );
	const v = reinterpret( AB, 0 );
	let k;
	let i;
	let j;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			if ( uplo === 'upper' && i <= j && j - i <= 1 ) {
				k = ( 1 + i - j ) + ( j * 2 );
			} else if ( uplo === 'lower' && i >= j && i - j <= 1 ) {
				k = ( i - j ) + ( j * 2 );
			} else {
				continue;
			}
			v[ 2 * k ] = A[ i ][ j ][ 0 ];
			v[ ( 2 * k ) + 1 ] = A[ i ][ j ][ 1 ];
		}
	}
	return AB;
}

/**
* Computes `A*x` for a dense complex matrix.
*
* @private
* @param {Array} A - dense matrix
* @param {Array} x - interleaved complex vector
* @returns {Array} interleaved product
*/
function cmatvec( A, x ) {
	const y = [];
	let re;
	let im;
	let i;
	let k;
	for ( i = 0; i < A.length; i++ ) {
		re = 0.0;
		im = 0.0;
		for ( k = 0; k < A.length; k++ ) {
			re += ( A[ i ][ k ][ 0 ] * x[ 2 * k ] ) - ( A[ i ][ k ][ 1 ] * x[ ( 2 * k ) + 1 ] ); // eslint-disable-line max-len
			im += ( A[ i ][ k ][ 0 ] * x[ ( 2 * k ) + 1 ] ) + ( A[ i ][ k ][ 1 ] * x[ 2 * k ] ); // eslint-disable-line max-len
		}
		y.push( re, im );
	}
	return y;
}

/**
* Returns the max-modulus norm of an interleaved complex vector.
*
* @private
* @param {Array} v - interleaved vector
* @returns {number} norm
*/
function cnormInf( v ) {
	let m = 0.0;
	let i;
	for ( i = 0; i < v.length; i += 2 ) {
		m = Math.max( m, Math.sqrt( ( v[ i ] * v[ i ] ) + ( v[ i + 1 ] * v[ i + 1 ] ) ) ); // eslint-disable-line max-len
	}
	return m;
}

/**
* Asserts that `x` solves `A*x = b` for `x_true`, with FERR bounding the true forward error.
*
* @private
* @param {Object} res - solver result
* @param {Array} xtrue - interleaved true solution
* @param {string} msg - message
*/
function assertSolves( res, xtrue, msg ) {
	const err = [];
	let i;
	for ( i = 0; i < xtrue.length; i++ ) {
		err.push( res.x[ i ] - xtrue[ i ] );
	}
	assert.equal( res.info, 0, msg + ': info' );
	assert.ok( cnormInf( err ) / cnormInf( res.x ) <= res.ferr[ 0 ], msg + ': FERR bounds the forward error (FERR=' + res.ferr[ 0 ] + ')' ); // eslint-disable-line max-len
	assert.ok( cnormInf( err ) / cnormInf( xtrue ) <= 1e-9, msg + ': x solves A*x = b' ); // eslint-disable-line max-len
	assert.ok( res.ferr[ 0 ] < 1e-3, msg + ': FERR is small' );
	assert.ok( res.berr[ 0 ] <= 1e-15, msg + ': BERR' );
}

test( 'zpbsvx: equilibrate a badly scaled matrix (EQUED=yes), then reuse the factorization with fact=factored', function t() { // eslint-disable-line max-len
	const xtrue = [ 1, -1, -2, 0.5, 3, 2, -4, -1 ];
	const uplos = [ 'upper', 'lower' ];
	const d = [ 1e-3, 1, 1e3, 1e-2 ];
	let res2;
	let AFB;
	let res;
	let AB;
	let A;
	let b;
	let S;
	let k;
	for ( k = 0; k < uplos.length; k++ ) {
		A = scaledHPD( d );
		b = cmatvec( A, xtrue );
		AB = toBand( A, uplos[ k ] );
		AFB = new Complex128Array( 8 );
		S = new Float64Array( 4 );
		res = callZpbsvx( 'equilibrate', uplos[ k ], 4, 1, 1, AB, AFB, 'none', S, new Complex128Array( b ) ); // eslint-disable-line max-len
		assert.equal( res.equed, 'yes', uplos[ k ] + ': equed' );
		assertArrayClose( res.s, [ 1 / ( 2e-3 ), 1 / Math.sqrt( 5 ), 1 / ( Math.sqrt( 6 ) * 1e3 ), 1 / ( Math.sqrt( 7 ) * 1e-2 ) ], 1e-14, 'S = 1/sqrt(diag(A))' ); // eslint-disable-line max-len
		assertSolves( res, xtrue, uplos[ k ] + '/equilibrate' );

		// AB now holds the equilibrated matrix and AFB its factor:
		res2 = callZpbsvx( 'factored', uplos[ k ], 4, 1, 1, AB, AFB, 'yes', S, new Complex128Array( b ) ); // eslint-disable-line max-len
		assertSolves( res2, xtrue, uplos[ k ] + '/factored' );
		assert.equal( res2.rcond, res.rcond, 'rcond' );
		assert.equal( res2.ferr[ 0 ], res.ferr[ 0 ], 'ferr' );
		assertArrayClose( res2.x, res.x, 1e-15, 'x' );
	}
});

test( 'zpbsvx: N=0 sets RCOND=1 and zero error bounds (no quick return in the reference)', function t() { // eslint-disable-line max-len
	const facts = [ 'not-factored', 'equilibrate', 'factored' ];
	const equeds = [ 'none', 'none', 'yes' ];
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 2 );
	const BERR = new Float64Array( 2 );
	const equed = [ 'none' ];
	let info;
	let k;
	for ( k = 0; k < facts.length; k++ ) {
		rcond[ 0 ] = -1.0;
		FERR.fill( -1.0 );
		BERR.fill( -1.0 );
		equed[ 0 ] = equeds[ k ];
		info = zpbsvx( facts[ k ], 'upper', 0, 0, 2, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, equed, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, rcond, FERR, 1, 0, BERR, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, facts[ k ] + ': info' );
		assert.equal( rcond[ 0 ], 1.0, facts[ k ] + ': rcond' );
		assert.deepEqual( toArray( FERR ), [ 0, 0 ], facts[ k ] + ': FERR' );
		assert.deepEqual( toArray( BERR ), [ 0, 0 ], facts[ k ] + ': BERR' );
		assert.equal( equed[ 0 ], equeds[ k ], facts[ k ] + ': equed' );
	}
});

test( 'zpbsvx: matrix singular to working precision returns info = N+1', function t() { // eslint-disable-line max-len
	// A = diag(1, 1e-20) (KD=0): positive definite but RCOND = 1e-20 < eps
	const AB = new Complex128Array( [ 1, 0, 1e-20, 0 ] );
	const B = new Complex128Array( [ 1, 1, 1e-20, 0 ] );
	const res = callZpbsvx( 'not-factored', 'upper', 2, 0, 1, AB, new Complex128Array( 2 ), 'none', new Float64Array( 2 ), B ); // eslint-disable-line max-len
	assert.equal( res.info, 3, 'info = N+1' );
	assert.ok( Math.abs( res.rcond - 1e-20 ) <= 1e-34, 'rcond = 1e-20' );
	assertArrayClose( res.x, [ 1, 1, 1, 0 ], 1e-14, 'x is still computed' );
});

test( 'zpbsvx: RWORK one element shorter than the declared N throws RangeError (ticket 0107)', function t() {
	const N = 3;
	function call( RWORK, offsetRWork ) {
		return zpbsvx( 'not-factored', 'upper', N, 1, 1, new Complex128Array( 2 * N ), 1, 2, 0, new Complex128Array( 2 * N ), 1, 2, 0, [ 'none' ], new Float64Array( N ), 1, 0, new Complex128Array( N ), 1, N, 0, new Complex128Array( N ), 1, N, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 2 * N ), 1, 0, RWORK, 1, offsetRWork ); // eslint-disable-line max-len
	}
	assert.throws( function short() {
		call( new Float64Array( N - 1 ), 0 );
	}, /RWORK array must have at least 3 elements from offset 0/ );
	assert.throws( function shortFromOffset() {
		call( new Float64Array( N ), 1 );
	}, /RWORK array must have at least 3 elements from offset 1/ );
	assert.doesNotThrow( function atMinimum() {
		call( new Float64Array( N + 1 ), 1 );
	});
});
