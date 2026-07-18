/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from '../../zhptrf/lib/base.js';
import zhpsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs_upper from './fixtures/multi_rhs_upper.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };

// VARIABLES //

// Upper packed 3x3 Hermitian: (1,1),(1,2),(2,2),(1,3),(2,3),(3,3)
const AP_UPPER_3 = [ // eslint-disable-line no-unused-vars
	4.0,
	0.0,
	1.0,
	2.0,
	5.0,
	0.0,
	2.0,
	-1.0,
	3.0,
	1.0,
	6.0,
	0.0
];

// Lower packed 3x3 Hermitian
const AP_LOWER_3 = [ // eslint-disable-line no-unused-vars
	4.0,
	0.0,
	1.0,
	-2.0,
	2.0,
	1.0,
	5.0,
	0.0,
	3.0,
	-1.0,
	6.0,
	0.0
];

// B for tests 1,3,8 (1 RHS)
const bData1 = [ 1.0, 0.0, 0.0, 1.0, 1.0, -1.0 ]; // eslint-disable-line no-unused-vars

// B for multi-rhs (2 RHS), column-major, N*nrhs = 3*2 = 6 complex elements
const bData2 = [ // eslint-disable-line no-unused-vars
	1.0,
	0.0,
	0.0,
	1.0,
	1.0,
	-1.0,
	2.0,
	1.0,
	1.0,
	-1.0,
	0.0,
	2.0
];

// Upper packed 4x4 well-conditioned Hermitian matrix
const AP_UPPER_4 = [
	4.0,
	0.0,
	0.5,
	0.3,
	5.0,
	0.0,
	0.3,
	-0.2,
	0.4,
	0.1,
	6.0,
	0.0,
	0.2,
	0.1,
	0.1,
	-0.3,
	0.5,
	0.2,
	7.0,
	0.0
];

// B for 4x4 pivot test (1 RHS)
const bData4 = [ 1.0, 0.0, 0.0, 1.0, 2.0, -1.0, 1.0, 1.0 ];

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
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
* @param {Array} actual - actual array
* @param {Array} expected - expected array
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
* Converts a typed array to a plain Array.
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
* Build a Complex128Array from a flat array of interleaved doubles.
*
* @private
* @param {Array} flatDoubles - interleaved real/imag values
* @param {integer} nc - number of complex elements
* @returns {Complex128Array} complex array
*/
function buildComplex( flatDoubles, nc ) {
	const out = new Complex128Array( nc );
	const ov = reinterpret( out, 0 );
	let i;
	for ( i = 0; i < 2 * nc; i++ ) {
		ov[ i ] = flatDoubles[ i ];
	}
	return out;
}

/**
* Helper: call zhpsvx with standard arguments.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Complex128Array} AP - original packed Hermitian matrix
* @param {Complex128Array} AFP - factored packed matrix (input if factored)
* @param {Int32Array} IPIV - pivot indices (input if factored)
* @param {Complex128Array} B - RHS matrix (col-major, N-by-nrhs)
* @returns {Object} result with info, x, rcond, ferr, berr, afp, ipiv
*/
function callZhpsvx( fact, uplo, N, nrhs, AP, AFP, IPIV, B ) {
	const rcond = new Float64Array( 1 );
	const RWORK = new Float64Array( Math.max( 1, N ) );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	const X = new Complex128Array( N * nrhs );

	const info = zhpsvx( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': reinterpret( X, 0 ),
		'rcond': rcond[ 0 ],
		'ferr': FERR,
		'berr': BERR,
		'afp': reinterpret( AFP, 0 ),
		'ipiv': IPIV
	};
}

// TESTS //

test( 'zhpsvx: fact_n_upper', function t() {

	const tc = fact_n_upper;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( tc.AP, nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( tc.n );
	const B = buildComplex( tc.b, tc.n * tc.nrhs );
	const res = callZhpsvx( 'not-factored', 'upper', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'zhpsvx: fact_n_lower', function t() {

	const tc = fact_n_lower;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( tc.AP, nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( tc.n );
	const B = buildComplex( tc.b, tc.n * tc.nrhs );
	const res = callZhpsvx( 'not-factored', 'lower', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'zhpsvx: fact_f_upper', function t() {
	let i;

	const tc = fact_f_upper;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( AP_UPPER_3, nn );
	const AFP = new Complex128Array( nn );
	const afpv = reinterpret( AFP, 0 );
	const apcv = reinterpret( AP, 0 );
	for ( i = 0; i < 2 * nn; i++ ) {
		afpv[ i ] = apcv[ i ];
	}
	const IPIV = new Int32Array( tc.n );
	zhptrf( 'upper', tc.n, AFP, 1, 0, IPIV, 1, 0 );
	const B = buildComplex( bData1, tc.n * tc.nrhs );
	const res = callZhpsvx( 'factored', 'upper', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zhpsvx: fact_f_lower', function t() {
	let j;

	const tc = fact_f_lower;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( AP_LOWER_3, nn );
	const AFP = new Complex128Array( nn );
	const afpv = reinterpret( AFP, 0 );
	const apcv = reinterpret( AP, 0 );
	for ( j = 0; j < 2 * nn; j++ ) {
		afpv[ j ] = apcv[ j ];
	}
	const IPIV = new Int32Array( tc.n );
	zhptrf( 'lower', tc.n, AFP, 1, 0, IPIV, 1, 0 );
	const B = buildComplex( bData1, tc.n * tc.nrhs );
	const res = callZhpsvx( 'factored', 'lower', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zhpsvx: n_zero', function t() {

	const tc = n_zero;
	const AP = new Complex128Array( 1 );
	const AFP = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const res = callZhpsvx( 'not-factored', 'upper', 0, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
});

test( 'zhpsvx: n_one_upper', function t() {

	const tc = n_one_upper;
	const AP = buildComplex( [ 4.0, 0.0 ], 1 );
	const AFP = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = buildComplex( [ 8.0, 4.0 ], 1 );
	const res = callZhpsvx( 'not-factored', 'upper', 1, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'zhpsvx: singular', function t() {

	const tc = singular;
	const nn = ( 3 * 4 ) / 2;
	const AP = buildComplex([
		4.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		6.0,
		0.0
	], nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( 3 );
	const B = buildComplex( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ], 3 );
	const res = callZhpsvx( 'not-factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'zhpsvx: multi_rhs_upper', function t() {

	const tc = multi_rhs_upper;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( AP_UPPER_3, nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( tc.n );
	const B = buildComplex( bData2, tc.n * tc.nrhs );
	const res = callZhpsvx( 'not-factored', 'upper', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'zhpsvx: multi_rhs_lower', function t() {

	const tc = multi_rhs_lower;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( AP_LOWER_3, nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( tc.n );
	const B = buildComplex( bData2, tc.n * tc.nrhs );
	const res = callZhpsvx( 'not-factored', 'lower', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'zhpsvx: upper_4x4', function t() {

	const tc = upper_4x4;
	const nn = ( tc.n * ( tc.n + 1 ) ) / 2;
	const AP = buildComplex( AP_UPPER_4, nn );
	const AFP = new Complex128Array( nn );
	const IPIV = new Int32Array( tc.n );
	const B = buildComplex( bData4, tc.n * tc.nrhs );
	const res = callZhpsvx( 'not-factored', 'upper', tc.n, tc.nrhs, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});
