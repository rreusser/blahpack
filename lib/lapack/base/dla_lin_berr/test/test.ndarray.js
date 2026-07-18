/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, node/no-sync, max-len */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_lin_berr from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dla_lin_berr.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Locates a test case in the fixture by name.
*
* @private
* @param {string} name - case name
* @returns {Object} case object
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two numbers are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are close within a relative tolerance.
*
* @private
* @param {ArrayLike} actual - actual values
* @param {ArrayLike} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - error message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a column-major `(nrows, ncols)` matrix from an array of column arrays.
*
* @private
* @param {Array<Array<number>>} cols - columns
* @param {NonNegativeInteger} nrows - number of rows
* @returns {Float64Array} column-major buffer
*/
function cm( cols, nrows ) {
	const out = new Float64Array( nrows * cols.length );
	let j, i;
	for ( j = 0; j < cols.length; j++ ) {
		for ( i = 0; i < nrows; i++ ) {
			out[ ( j * nrows ) + i ] = cols[ j ][ i ];
		}
	}
	return out;
}


// TESTS //

test( 'dla_lin_berr: basic', function t() {
	const resCols = [
		[ 1e-10, 2e-10, 3e-10, 4e-10 ],
		[ 5e-10, 6e-10, 7e-10, 8e-10 ]
	];
	const aybCols = [
		[ 1, 2, 3, 4 ],
		[ 10, 20, 30, 40 ]
	];
	const nrows = 4;
	const nrhs = 2;
	const berr = new Float64Array( nrhs );
	const res = cm( resCols, nrows );
	const ayb = cm( aybCols, nrows );
	const tc = findCase( 'basic' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: zero_denom (AYB has zeros - rows skipped)', function t() {
	const resCols = [
		[ 1e-8, 2e-8, 3e-8 ],
		[ 4e-8, 5e-8, 6e-8 ]
	];
	const aybCols = [
		[ 0, 1, 0 ],
		[ 0, 0, 0 ]
	];
	const nrows = 3;
	const nrhs = 2;
	const berr = new Float64Array( nrhs );
	const res = cm( resCols, nrows );
	const ayb = cm( aybCols, nrows );
	const tc = findCase( 'zero_denom' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: n_one', function t() {
	const nrows = 1;
	const nrhs = 1;
	const berr = new Float64Array( nrhs );
	const res = new Float64Array( [ 1e-6 ] );
	const ayb = new Float64Array( [ 2.0 ] );
	const tc = findCase( 'n_one' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: multi_rhs', function t() {
	const resCols = [
		[ 1, 0.5, 0.25 ],
		[ -1e-5, 2e-5, -3e-5 ],
		[ 1, 1, 1 ]
	];
	const aybCols = [
		[ 2, 4, 8 ],
		[ 1, 2, 3 ],
		[ 1, 0.5, 0.25 ]
	];
	const nrows = 3;
	const nrhs = 3;
	const berr = new Float64Array( nrhs );
	const res = cm( resCols, nrows );
	const ayb = cm( aybCols, nrows );
	const tc = findCase( 'multi_rhs' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: nrhs_zero (quick return, berr untouched)', function t() {
	const nrhs = 0;
	const berr = new Float64Array( [ 99.0 ] );
	const res = new Float64Array( 1 );
	const ayb = new Float64Array( 1 );
	dla_lin_berr( 3, 3, nrhs, res, 1, 3, 0, ayb, 1, 3, 0, berr, 1, 0 );
	assert.strictEqual( berr[ 0 ], 99.0, 'berr unchanged' );
});

test( 'dla_lin_berr: n_zero (quick return, berr untouched)', function t() {
	const nrhs = 2;
	const berr = new Float64Array( [ 7.0, 8.0 ] );
	const res = new Float64Array( 1 );
	const ayb = new Float64Array( 1 );
	dla_lin_berr( 0, 0, nrhs, res, 1, 0, 0, ayb, 1, 0, 0, berr, 1, 0 );
	assert.strictEqual( berr[ 0 ], 7.0, 'berr[0] unchanged' );
	assert.strictEqual( berr[ 1 ], 8.0, 'berr[1] unchanged' );
});

test( 'dla_lin_berr: honors offsets and strides', function t() {
	const nrows = 2;
	const nrhs = 2;
	const ldim = 4;
	const berr = new Float64Array( 4 );
	const res = new Float64Array( ldim * nrhs );
	const ayb = new Float64Array( ldim * nrhs );

	// Pack two matrices into a larger buffer with an offset and ldim > nrows.
	res[ 0 ] = 1e-3;
	res[ 1 ] = 2e-3;
	res[ ldim ] = 3e-3;
	res[ ldim + 1 ] = 4e-3;
	ayb[ 0 ] = 1.0;
	ayb[ 1 ] = 4.0;
	ayb[ ldim ] = 2.0;
	ayb[ ldim + 1 ] = 8.0;
	dla_lin_berr( nrows, nrows, nrhs, res, 1, ldim, 0, ayb, 1, ldim, 0, berr, 2, 1 );

	// Col 0: max(1e-3/1, 2e-3/4) = 1e-3. Col 1: max(3e-3/2, 4e-3/8) = 1.5e-3.
	assertClose( berr[ 1 ], 1e-3, 1e-12, 'col 0' );
	assertClose( berr[ 3 ], 1.5e-3, 1e-12, 'col 1' );
	assert.strictEqual( berr[ 0 ], 0.0, 'untouched by offset' );
	assert.strictEqual( berr[ 2 ], 0.0, 'untouched by stride' );
});

test( 'dla_lin_berr: row-major (strideRES1 = nrhs, strideRES2 = 1)', function t() {
	const resCols = [
		[ 1e-4, 2e-4, 3e-4 ],
		[ 4e-4, 5e-4, 6e-4 ]
	];
	const aybCols = [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ]
	];
	const nrows = 3;
	const nrhs = 2;
	const berr = new Float64Array( nrhs );
	const res = new Float64Array( nrows * nrhs );
	const ayb = new Float64Array( nrows * nrhs );
	let i, j;

	// Store RES and AYB row-major: element (i,j) at i*nrhs + j.
	for ( i = 0; i < nrows; i++ ) {
		for ( j = 0; j < nrhs; j++ ) {
			res[ ( i * nrhs ) + j ] = resCols[ j ][ i ];
			ayb[ ( i * nrhs ) + j ] = aybCols[ j ][ i ];
		}
	}
	dla_lin_berr( nrows, nrows, nrhs, res, nrhs, 1, 0, ayb, nrhs, 1, 0, berr, 1, 0 );

	// Col 0: max(1e-4/1, 2e-4/2, 3e-4/3) = 1e-4.

	// Col 1: max(4e-4/4, 5e-4/5, 6e-4/6) = 1e-4.
	assertClose( berr[ 0 ], 1e-4, 1e-12, 'col 0' );
	assertClose( berr[ 1 ], 1e-4, 1e-12, 'col 1' );
});
