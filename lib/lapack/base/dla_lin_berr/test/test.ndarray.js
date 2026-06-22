/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, node/no-sync, max-len */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_lin_berr from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dla_lin_berr.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	var i;
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
	var out = new Float64Array( nrows * cols.length );
	var j;
	var i;
	for ( j = 0; j < cols.length; j++ ) {
		for ( i = 0; i < nrows; i++ ) {
			out[ ( j * nrows ) + i ] = cols[ j ][ i ];
		}
	}
	return out;
}


// TESTS //

test( 'dla_lin_berr: basic', function t() {
	var resCols = [
		[ 1e-10, 2e-10, 3e-10, 4e-10 ],
		[ 5e-10, 6e-10, 7e-10, 8e-10 ]
	];
	var aybCols = [
		[ 1, 2, 3, 4 ],
		[ 10, 20, 30, 40 ]
	];
	var nrows = 4;
	var nrhs = 2;
	var berr = new Float64Array( nrhs );
	var res = cm( resCols, nrows );
	var ayb = cm( aybCols, nrows );
	var tc = findCase( 'basic' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: zero_denom (AYB has zeros - rows skipped)', function t() {
	var resCols = [
		[ 1e-8, 2e-8, 3e-8 ],
		[ 4e-8, 5e-8, 6e-8 ]
	];
	var aybCols = [
		[ 0, 1, 0 ],
		[ 0, 0, 0 ]
	];
	var nrows = 3;
	var nrhs = 2;
	var berr = new Float64Array( nrhs );
	var res = cm( resCols, nrows );
	var ayb = cm( aybCols, nrows );
	var tc = findCase( 'zero_denom' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: n_one', function t() {
	var nrows = 1;
	var nrhs = 1;
	var berr = new Float64Array( nrhs );
	var res = new Float64Array( [ 1e-6 ] );
	var ayb = new Float64Array( [ 2.0 ] );
	var tc = findCase( 'n_one' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: multi_rhs', function t() {
	var resCols = [
		[ 1, 0.5, 0.25 ],
		[ -1e-5, 2e-5, -3e-5 ],
		[ 1, 1, 1 ]
	];
	var aybCols = [
		[ 2, 4, 8 ],
		[ 1, 2, 3 ],
		[ 1, 0.5, 0.25 ]
	];
	var nrows = 3;
	var nrhs = 3;
	var berr = new Float64Array( nrhs );
	var res = cm( resCols, nrows );
	var ayb = cm( aybCols, nrows );
	var tc = findCase( 'multi_rhs' );
	dla_lin_berr( nrows, nrows, nrhs, res, 1, nrows, 0, ayb, 1, nrows, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'dla_lin_berr: nrhs_zero (quick return, berr untouched)', function t() {
	var nrhs = 0;
	var berr = new Float64Array( [ 99.0 ] );
	var res = new Float64Array( 1 );
	var ayb = new Float64Array( 1 );
	dla_lin_berr( 3, 3, nrhs, res, 1, 3, 0, ayb, 1, 3, 0, berr, 1, 0 );
	assert.strictEqual( berr[ 0 ], 99.0, 'berr unchanged' );
});

test( 'dla_lin_berr: n_zero (quick return, berr untouched)', function t() {
	var nrhs = 2;
	var berr = new Float64Array( [ 7.0, 8.0 ] );
	var res = new Float64Array( 1 );
	var ayb = new Float64Array( 1 );
	dla_lin_berr( 0, 0, nrhs, res, 1, 0, 0, ayb, 1, 0, 0, berr, 1, 0 );
	assert.strictEqual( berr[ 0 ], 7.0, 'berr[0] unchanged' );
	assert.strictEqual( berr[ 1 ], 8.0, 'berr[1] unchanged' );
});

test( 'dla_lin_berr: honors offsets and strides', function t() {
	var nrows = 2;
	var nrhs = 2;
	var ldim = 4;
	var berr = new Float64Array( 4 );
	var res = new Float64Array( ldim * nrhs );
	var ayb = new Float64Array( ldim * nrhs );

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
	var resCols = [
		[ 1e-4, 2e-4, 3e-4 ],
		[ 4e-4, 5e-4, 6e-4 ]
	];
	var aybCols = [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ]
	];
	var nrows = 3;
	var nrhs = 2;
	var berr = new Float64Array( nrhs );
	var res = new Float64Array( nrows * nrhs );
	var ayb = new Float64Array( nrows * nrhs );
	var i;
	var j;

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
