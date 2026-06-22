/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpptrf from '../../zpptrf/lib/base.js';
import zppsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import fact_e_upper from './fixtures/fact_e_upper.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };
import fact_f_equed_y_upper from './fixtures/fact_f_equed_y_upper.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };
import not_hpd from './fixtures/not_hpd.json' with { type: 'json' };
import fact_e_multi_rhs from './fixtures/fact_e_multi_rhs.json' with { type: 'json' };

// VARIABLES //

// 3x3 HPD matrix data (interleaved real/imag):

// A = [10  3-i  1+2i;  3+i  8  2-i;  1-2i  2+i  6]
var AP_UPPER = [ 10, 0, 3, -1, 8, 0, 1, 2, 2, -1, 6, 0 ];
var AP_LOWER = [ 10, 0, 3, 1, 1, -2, 8, 0, 2, 1, 6, 0 ];
var B_1RHS = [ 1, 1, 2, -1, 3, 0.5 ];
var B_2RHS = [ 1, 1, 2, -1, 3, 0.5, 5, -2, -1, 3, 4, 1 ];

// FUNCTIONS //

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Creates a Complex128Array from interleaved real/imaginary doubles.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

/**
* Runs zppsvx with FACT='not-factored' or 'equilibrate'.
*
* @private
* @param {string} fact - 'not-factored' or 'equilibrate'
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - order
* @param {number} nrhs - number of RHS
* @param {Array} apData - interleaved packed matrix data
* @param {Array} bData - interleaved RHS data
* @returns {Object} result
*/
function runCase( fact, uplo, N, nrhs, apData, bData ) {
	var equed = [ 'none' ];
	var RWORK = new Float64Array( N );
	var rcond = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 * N );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var info;
	var AFP;
	var nAP;
	var AP;
	var S;
	var B;
	var X;

	nAP = ( N * ( N + 1 ) / 2 ) | 0;
	AFP = new Complex128Array( nAP );
	X = new Complex128Array( N * nrhs );
	AP = c128( apData );
	S = new Float64Array( N );
	B = c128( bData );

	info = zppsvx( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': toArray( reinterpret( X, 0 ) ),
		'afp': toArray( reinterpret( AFP, 0 ) ),
		'rcond': rcond[ 0 ],
		'ferr': toArray( FERR ),
		'berr': toArray( BERR ),
		's': toArray( S ),
		'equed': equed[ 0 ]
	};
}

// TESTS //

test( 'zppsvx is a function', function t() {
	assert.equal( typeof zppsvx, 'function' );
});

test( 'zppsvx: fact_n_upper', function t() {
	var tc = fact_n_upper;
	var r = runCase( 'not-factored', 'upper', 3, 1, AP_UPPER, B_1RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.afp, tc.afp, 1e-12, 'afp' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
	assert.equal( r.equed, 'none', 'equed' );
});

test( 'zppsvx: fact_n_lower', function t() {
	var tc = fact_n_lower;
	var r = runCase( 'not-factored', 'lower', 3, 1, AP_LOWER, B_1RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.afp, tc.afp, 1e-12, 'afp' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
	assert.equal( r.equed, 'none', 'equed' );
});

test( 'zppsvx: fact_f_upper', function t() {
	var RWORK = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var equed = [ 'none' ];
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 6 );
	var info;
	var AFP;
	var tc;
	var AP;
	var S;
	var B;
	var X;

	tc = fact_f_upper;
	AP = c128( AP_UPPER );
	AFP = new Complex128Array( AP.buffer.slice( 0 ) );
	zpptrf( 'upper', 3, AFP, 1, 0 );
	B = c128( B_1RHS );
	X = new Complex128Array( 3 );
	S = new Float64Array( 3 );

	info = zppsvx( 'factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( X, 0 ) ), tc.x, 1e-12, 'x' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-12, 'berr' );
});

test( 'zppsvx: fact_f_lower', function t() {
	var RWORK = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var equed = [ 'none' ];
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 6 );
	var info;
	var AFP;
	var tc;
	var AP;
	var S;
	var B;
	var X;

	tc = fact_f_lower;
	AP = c128( AP_LOWER );
	AFP = new Complex128Array( AP.buffer.slice( 0 ) );
	zpptrf( 'lower', 3, AFP, 1, 0 );
	B = c128( B_1RHS );
	X = new Complex128Array( 3 );
	S = new Float64Array( 3 );

	info = zppsvx( 'factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( X, 0 ) ), tc.x, 1e-12, 'x' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-12, 'berr' );
});

test( 'zppsvx: n_zero', function t() {
	var RWORK = new Float64Array( 1 );
	var rcond = new Float64Array( 1 );
	var equed = [ 'none' ];
	var WORK = new Complex128Array( 2 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var info;
	var AFP = new Complex128Array( 1 );
	var AP = new Complex128Array( 1 );
	var S = new Float64Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );

	info = zppsvx( 'not-factored', 'upper', 0, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 0, 0, X, 1, 0, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zppsvx: n_one_upper', function t() {
	var tc = n_one_upper;
	var r = runCase( 'not-factored', 'upper', 1, 1, [ 4, 0 ], [ 8, 4 ] );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
});

test( 'zppsvx: fact_e_upper', function t() {
	var tc = fact_e_upper;
	var r = runCase( 'equilibrate', 'upper', 3, 1, AP_UPPER, B_1RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.afp, tc.afp, 1e-12, 'afp' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( r.s, tc.s, 1e-12, 's' );
});

test( 'zppsvx: fact_e_lower', function t() {
	var tc = fact_e_lower;
	var r = runCase( 'equilibrate', 'lower', 3, 1, AP_LOWER, B_1RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.afp, tc.afp, 1e-12, 'afp' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( r.s, tc.s, 1e-12, 's' );
});

test( 'zppsvx: fact_f_equed_y_upper', function t() {
	var RWORK = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var equed = [ 'yes' ];
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 6 );
	var afpv;
	var info;
	var AFP;
	var apv;
	var tc;
	var AP;
	var Bv;
	var S;
	var B;
	var X;

	tc = fact_f_equed_y_upper;

	// s(i) = 1/sqrt(diag(i))
	S = new Float64Array( [ 1.0 / Math.sqrt( 10.0 ), 1.0 / Math.sqrt( 8.0 ), 1.0 / Math.sqrt( 6.0 ) ] ); // eslint-disable-line max-len

	AP = c128( AP_UPPER );
	apv = reinterpret( AP, 0 );

	// Equilibrate AP manually: afp(i,j) = s(i)*ap(i,j)*s(j)
	AFP = new Complex128Array( 6 );
	afpv = reinterpret( AFP, 0 );
	afpv[ 0 ] = S[ 0 ] * apv[ 0 ] * S[ 0 ];
	afpv[ 1 ] = 0.0;
	afpv[ 2 ] = S[ 0 ] * apv[ 2 ] * S[ 1 ];
	afpv[ 3 ] = S[ 0 ] * apv[ 3 ] * S[ 1 ];
	afpv[ 4 ] = S[ 1 ] * apv[ 4 ] * S[ 1 ];
	afpv[ 5 ] = 0.0;
	afpv[ 6 ] = S[ 0 ] * apv[ 6 ] * S[ 2 ];
	afpv[ 7 ] = S[ 0 ] * apv[ 7 ] * S[ 2 ];
	afpv[ 8 ] = S[ 1 ] * apv[ 8 ] * S[ 2 ];
	afpv[ 9 ] = S[ 1 ] * apv[ 9 ] * S[ 2 ];
	afpv[ 10 ] = S[ 2 ] * apv[ 10 ] * S[ 2 ];
	afpv[ 11 ] = 0.0;
	zpptrf( 'upper', 3, AFP, 1, 0 );

	// Equilibrate b: b_eq(i) = s(i)*b(i)
	B = new Complex128Array( 3 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = S[ 0 ] * 1.0;
	Bv[ 1 ] = S[ 0 ] * 1.0;
	Bv[ 2 ] = S[ 1 ] * 2.0;
	Bv[ 3 ] = S[ 1 ] * ( -1.0 );
	Bv[ 4 ] = S[ 2 ] * 3.0;
	Bv[ 5 ] = S[ 2 ] * 0.5;

	X = new Complex128Array( 3 );

	info = zppsvx( 'factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( X, 0 ) ), tc.x, 1e-12, 'x' );
});

test( 'zppsvx: multi_rhs', function t() {
	var tc = multi_rhs;
	var r = runCase( 'not-factored', 'upper', 3, 2, AP_UPPER, B_2RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
});

test( 'zppsvx: multi_rhs_lower', function t() {
	var tc = multi_rhs_lower;
	var r = runCase( 'not-factored', 'lower', 3, 2, AP_LOWER, B_2RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
});

test( 'zppsvx: not_hpd', function t() {
	var tc = not_hpd;
	var r = runCase( 'not-factored', 'upper', 2, 1, [ 1, 0, 2, 1, 1, 0 ], [ 1, 0, 2, 0 ] ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.rcond, tc.rcond, 'rcond' );
});

test( 'zppsvx: fact_e_multi_rhs', function t() {
	var tc = fact_e_multi_rhs;
	var r = runCase( 'equilibrate', 'upper', 3, 2, AP_UPPER, B_2RHS );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( r.x, tc.x, 1e-12, 'x' );
	assertArrayClose( r.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( r.s, tc.s, 1e-12, 's' );
});
