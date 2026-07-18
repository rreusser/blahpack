/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytri3 from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zsytri_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});

// The Fortran test uses NMAX=6 as the declared leading dimension.
const LDA = 6;

// Must match the hardcoded block size in base.js.
const NB = 1;


// FUNCTIONS //

/**
* Finds a fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a Fortran 1-based IPIV array into the JS convention used by `zsytrf_rk`.
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	let i;
	const out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		out[ i ] = ( ipivF[ i ] > 0 ) ? ( ipivF[ i ] - 1 ) : ipivF[ i ];
	}
	return out;
}

/**
* Asserts approximate scalar equality.
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
* Asserts triangle equality against a reference column-major interleaved complex buffer using leading dimension `LDA`.
*
* @private
* @param {Float64Array} actualView - computed Float64 view
* @param {Array<number>} expected - reference interleaved re/im array
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertTriangleClose( actualView, expected, uplo, N, tol, msg ) {
	let idx, i, j;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				idx = 2 * ( i + ( j * LDA ) );
				assertClose( actualView[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + '].re' ); // eslint-disable-line max-len
				assertClose( actualView[ idx + 1 ], expected[ idx + 1 ], tol, msg + '[' + i + ',' + j + '].im' ); // eslint-disable-line max-len
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				idx = 2 * ( i + ( j * LDA ) );
				assertClose( actualView[ idx ], expected[ idx ], tol, msg + '[' + i + ',' + j + '].re' ); // eslint-disable-line max-len
				assertClose( actualView[ idx + 1 ], expected[ idx + 1 ], tol, msg + '[' + i + ',' + j + '].im' ); // eslint-disable-line max-len
			}
		}
	}
}

/**
* Rehydrates a Complex128Array from interleaved re/im float data.
*
* @private
* @param {Array<number>} data - interleaved real/imag data
* @returns {Complex128Array} complex array
*/
function makeComplex( data ) {
	let i;
	const buf = new Float64Array( data.length );
	for ( i = 0; i < data.length; i++ ) {
		buf[ i ] = data[ i ];
	}
	return new Complex128Array( buf.buffer );
}

/**
* Runs a fixture-driven test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {Object} tc - fixture entry
*/
function runFixture( uplo, N, tc ) {

	const A = makeComplex( tc.a_factored );
	const e = makeComplex( tc.e );
	const ipiv = convertIpiv( tc.ipiv );
	const lwork = ( N + NB + 1 ) * ( NB + 3 );
	const work = new Complex128Array( lwork );
	const info = zsytri3( uplo, N, A, 1, LDA, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );

	const Aview = new Float64Array( A.buffer );
	assertTriangleClose( Aview, tc.a_inv, uplo, N, 1e-10, 'a_inv' );
}


// TESTS //

test( 'zsytri_3: 4x4 upper complex symmetric definite', function t() {
	runFixture( 'upper', 4, findCase( '4x4_upper_def' ) );
});

test( 'zsytri_3: 4x4 lower complex symmetric definite', function t() {
	runFixture( 'lower', 4, findCase( '4x4_lower_def' ) );
});

test( 'zsytri_3: 4x4 upper indefinite (2x2 pivots)', function t() {
	runFixture( 'upper', 4, findCase( '4x4_upper_indef' ) );
});

test( 'zsytri_3: N=1 lower trivial inverse', function t() {
	const tc = findCase( 'n_one_lower' );
	const A = makeComplex( [ 5.0, 2.0 ] );
	const e = makeComplex( [ 0.0, 0.0 ] );
	const ipiv = new Int32Array( [ 0 ] );
	const lwork = ( 1 + NB + 1 ) * ( NB + 3 );
	const work = new Complex128Array( lwork );
	const info = zsytri3( 'lower', 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	const view = new Float64Array( A.buffer );
	assertClose( view[ 0 ], tc.a_inv[ 0 ], 1e-14, 'A[0,0].re' );
	assertClose( view[ 1 ], tc.a_inv[ 1 ], 1e-14, 'A[0,0].im' );
});

test( 'zsytri_3: N=0 quick return', function t() {
	const A = new Complex128Array( 0 );
	const e = new Complex128Array( 0 );
	const ipiv = new Int32Array( 0 );
	const work = new Complex128Array( 10 );
	const info = zsytri3( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zsytri_3: validation throws on invalid uplo', function t() {
	let ipiv, work, A, e;
	A = new Complex128Array( 4 );
	e = new Complex128Array( 2 );
	ipiv = new Int32Array( 2 );
	work = new Complex128Array( 40 );
	assert.throws( function fn() {
		zsytri3( 'invalid', 2, A, 1, 2, 0, e, 1, 0, ipiv, 1, 0, work, 1, 0 );
	}, TypeError );
});
