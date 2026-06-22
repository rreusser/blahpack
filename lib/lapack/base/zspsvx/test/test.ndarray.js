/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrf from '../../zsptrf/lib/base.js';
import zspsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };

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
* Helper: call zspsvx with packed storage arrays.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Complex128Array} AP - original packed matrix
* @param {Complex128Array} AFP - factored packed matrix (input if factored)
* @param {Int32Array} IPIV - pivot indices (input if factored)
* @param {Complex128Array} B - RHS matrix (col-major, N-by-nrhs)
* @returns {Object} result with info, x, rcond, ferr, berr, afp, ipiv
*/
function callZspsvx( fact, uplo, N, nrhs, AP, AFP, IPIV, B ) {
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	var RWORK = new Float64Array( Math.max( 1, N ) );
	var X = new Complex128Array( N * nrhs );
	var info;

	info = zspsvx( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'rcond': rcond[ 0 ],
		'ferr': FERR,
		'berr': BERR,
		'afp': AFP,
		'ipiv': IPIV
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zspsvx: fact_n_upper', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_n_upper;

	// Upper packed: A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
	AP = new Complex128Array( [ 4, 1, 2, -1, 5, 0.5, 1, 2, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array( [ 7, 2, 10, -1.5, 10, 2 ] );
	res = callZspsvx( 'not-factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( reinterpret( res.afp, 0 ) ), tc.afp, 1e-14, 'afp' );
});

test( 'zspsvx: fact_n_lower', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_n_lower;

	// Lower packed: A(1,1), A(2,1), A(3,1), A(2,2), A(3,2), A(3,3)
	AP = new Complex128Array( [ 4, 1, 2, -1, 1, 2, 5, 0.5, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array( [ 7, 2, 10, -1.5, 10, 2 ] );
	res = callZspsvx( 'not-factored', 'lower', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( reinterpret( res.afp, 0 ) ), tc.afp, 1e-14, 'afp' );
});

test( 'zspsvx: fact_f_upper', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_f_upper;
	AP = new Complex128Array( [ 4, 1, 2, -1, 5, 0.5, 1, 2, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( [ 4, 1, 2, -1, 5, 0.5, 1, 2, 3, -1, 6, 1 ] );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array( [ 7, 2, 10, -1.5, 10, 2 ] );
	zsptrf( 'upper', 3, AFP, 1, 0, IPIV, 1, 0 );
	res = callZspsvx( 'factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zspsvx: fact_f_lower', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_f_lower;
	AP = new Complex128Array( [ 4, 1, 2, -1, 1, 2, 5, 0.5, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( [ 4, 1, 2, -1, 1, 2, 5, 0.5, 3, -1, 6, 1 ] );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array( [ 7, 2, 10, -1.5, 10, 2 ] );
	zsptrf( 'lower', 3, AFP, 1, 0, IPIV, 1, 0 );
	res = callZspsvx( 'factored', 'lower', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zspsvx: n_zero', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_zero;
	AP = new Complex128Array( 1 );
	AFP = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	res = callZspsvx( 'not-factored', 'upper', 0, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
});

test( 'zspsvx: n_one_upper', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_one_upper;
	AP = new Complex128Array( [ 4, 1 ] );
	AFP = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( [ 8, 2 ] );
	res = callZspsvx( 'not-factored', 'upper', 1, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zspsvx: n_one_lower', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_one_lower;
	AP = new Complex128Array( [ 5, 2 ] );
	AFP = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( [ 15, 6 ] );
	res = callZspsvx( 'not-factored', 'lower', 1, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zspsvx: singular', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = singular;
	AP = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
	AFP = new Complex128Array( 3 );
	IPIV = new Int32Array( 2 );
	B = new Complex128Array( [ 1, 0, 2, 0 ] );
	res = callZspsvx( 'not-factored', 'upper', 2, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'zspsvx: multi_rhs', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = multi_rhs;
	AP = new Complex128Array( [ 4, 1, 2, -1, 5, 0.5, 1, 2, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( 6 );
	IPIV = new Int32Array( 3 );

	// b(:,1) = A*[1;1;1], b(:,2) = A*[2+i; 3-i; 4]
	B = new Complex128Array( [
		7, 2, 10, -1.5, 10, 2,
		16, 9, 32.5, -7.5, 32, 3
	] );
	res = callZspsvx( 'not-factored', 'upper', 3, 2, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zspsvx: multi_rhs_lower', function t() {
	var IPIV;
	var AFP;
	var Xv;
	var res;
	var tc;
	var AP;
	var B;

	tc = multi_rhs_lower;
	AP = new Complex128Array( [ 4, 1, 2, -1, 1, 2, 5, 0.5, 3, -1, 6, 1 ] );
	AFP = new Complex128Array( 6 );
	IPIV = new Int32Array( 3 );

	// Same RHS as multi_rhs test
	B = new Complex128Array( [
		7, 2, 10, -1.5, 10, 2,
		16, 9, 32.5, -7.5, 32, 3
	] );
	res = callZspsvx( 'not-factored', 'lower', 3, 2, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	Xv = reinterpret( res.x, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});
