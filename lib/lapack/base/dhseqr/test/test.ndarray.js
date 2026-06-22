/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhseqr from './../lib/ndarray.js';

// FIXTURES //

import eigenvalues_only_6x6 from './fixtures/eigenvalues_only_6x6.json' with { type: 'json' };
import schur_with_z_init_4x4 from './fixtures/schur_with_z_init_4x4.json' with { type: 'json' };
import schur_with_z_update_4x4 from './fixtures/schur_with_z_update_4x4.json' with { type: 'json' };
import schur_no_z_4x4 from './fixtures/schur_no_z_4x4.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import n2_complex from './fixtures/n2_complex.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import complex_pairs_6x6 from './fixtures/complex_pairs_6x6.json' with { type: 'json' };
import partial_range_6x6 from './fixtures/partial_range_6x6.json' with { type: 'json' };

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
* Builds an N-by-N column-major matrix from Fortran-style assignments.
* Returns a Float64Array of length N*N with stride1=1, stride2=N.
*
* @param {NonNegativeInteger} N - matrix dimension
* @param {Array} entries - array of [row, col, value] (0-based)
* @returns {Float64Array} column-major matrix
*/
function makeMatrix( N, entries ) {
	var A = new Float64Array( N * N );
	var k;
	for ( k = 0; k < entries.length; k++ ) {
		A[ entries[ k ][ 0 ] + ( entries[ k ][ 1 ] * N ) ] = entries[ k ][ 2 ];
	}
	return A;
}

/**
* Extracts a 1D array from a column-major matrix.
*
* @param {Float64Array} A - column-major matrix
* @param {integer} N - matrix dimension
* @returns {Array} extracted column-major values as plain array
*/
function matrixToArray( A, N ) {
	var result = [];
	var i;
	for ( i = 0; i < N * N; i++ ) {
		result.push( A[ i ] );
	}
	return result;
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

test( 'dhseqr: eigenvalues_only_6x6', function t() {
	var expectedWR;
	var expectedWI;
	var actualWR;
	var actualWI;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = eigenvalues_only_6x6;
	N = 6;
	H = makeMatrix( N, [
		[ 0, 0, 4.0 ],
		[ 0, 1, 3.0 ],
		[ 0, 2, 2.0 ],
		[ 0, 3, 1.0 ],
		[ 0, 4, 0.5 ],
		[ 0, 5, 0.1 ], // eslint-disable-line max-len
		[ 1, 0, 1.0 ],
		[ 1, 1, 4.0 ],
		[ 1, 2, 3.0 ],
		[ 1, 3, 2.0 ],
		[ 1, 4, 1.0 ],
		[ 1, 5, 0.5 ], // eslint-disable-line max-len
		[ 2, 1, 1.0 ],
		[ 2, 2, 4.0 ],
		[ 2, 3, 3.0 ],
		[ 2, 4, 2.0 ],
		[ 2, 5, 1.0 ],
		[ 3, 2, 1.0 ],
		[ 3, 3, 4.0 ],
		[ 3, 4, 3.0 ],
		[ 3, 5, 2.0 ],
		[ 4, 3, 1.0 ],
		[ 4, 4, 4.0 ],
		[ 4, 5, 3.0 ],
		[ 5, 4, 1.0 ],
		[ 5, 5, 4.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'eigenvalues', 'none', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	actualWR = toArray( WR ).sort( function ( a, b ) { return a - b; } );
	expectedWR = tc.wr.slice().sort( function ( a, b ) { return a - b; } );
	assertArrayClose( actualWR, expectedWR, 1e-12, 'wr' );
	actualWI = toArray( WI ).sort( function ( a, b ) { return a - b; } );
	expectedWI = tc.wi.slice().sort( function ( a, b ) { return a - b; } );
	assertArrayClose( actualWI, expectedWI, 1e-12, 'wi' );
});

test( 'dhseqr: schur_with_z_init_4x4', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = schur_with_z_init_4x4;
	N = 4;
	H = makeMatrix( N, [
		[ 0, 0, 4.0 ],
		[ 0, 1, 3.0 ],
		[ 0, 2, 2.0 ],
		[ 0, 3, 1.0 ],
		[ 1, 0, 1.0 ],
		[ 1, 1, 4.0 ],
		[ 1, 2, 3.0 ],
		[ 1, 3, 2.0 ],
		[ 2, 1, 1.0 ],
		[ 2, 2, 4.0 ],
		[ 2, 3, 3.0 ],
		[ 3, 2, 1.0 ],
		[ 3, 3, 4.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: schur_with_z_update_4x4', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = schur_with_z_update_4x4;
	N = 4;
	H = makeMatrix( N, [
		[ 0, 0, 2.0 ],
		[ 0, 1, 1.0 ],
		[ 0, 2, 0.5 ],
		[ 0, 3, 0.1 ],
		[ 1, 0, 3.0 ],
		[ 1, 1, 1.0 ],
		[ 1, 2, 2.0 ],
		[ 1, 3, 0.5 ],
		[ 2, 1, 1.0 ],
		[ 2, 2, 3.0 ],
		[ 2, 3, 1.0 ],
		[ 3, 2, 0.5 ],
		[ 3, 3, 4.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = makeMatrix( N, [
		[ 0, 0, 1.0 ], [ 1, 1, 1.0 ], [ 2, 2, 1.0 ], [ 3, 3, 1.0 ]
	]);
	info = dhseqr( 'schur', 'update', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: schur_no_z_4x4', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = schur_no_z_4x4;
	N = 4;
	H = makeMatrix( N, [
		[ 0, 0, 4.0 ],
		[ 0, 1, 3.0 ],
		[ 0, 2, 2.0 ],
		[ 0, 3, 1.0 ],
		[ 1, 0, 1.0 ],
		[ 1, 1, 4.0 ],
		[ 1, 2, 3.0 ],
		[ 1, 3, 2.0 ],
		[ 2, 1, 1.0 ],
		[ 2, 2, 4.0 ],
		[ 2, 3, 3.0 ],
		[ 3, 2, 1.0 ],
		[ 3, 3, 4.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'none', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
});

test( 'dhseqr: n0', function t() {
	var info;
	var WR;
	var WI;
	var H;
	var Z;

	WR = new Float64Array( 1 );
	WI = new Float64Array( 1 );
	H = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	info = dhseqr( 'schur', 'initialize', 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, Z, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dhseqr: n1', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = n1;
	N = 1;
	H = new Float64Array( [ 7.0 ] );
	WR = new Float64Array( 1 );
	WI = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, Z, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.wr1, 1e-14, 'wr1' );
	assertClose( WI[ 0 ], tc.wi1, 1e-14, 'wi1' );
	assertClose( H[ 0 ], tc.h11, 1e-14, 'h11' );
	assertClose( Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dhseqr: n2_complex', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = n2_complex;
	N = 2;
	H = makeMatrix( N, [
		[ 0, 0, 0.0 ],
		[ 0, 1, -2.0 ],
		[ 1, 0, 1.0 ],
		[ 1, 1, 0.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: ilo_eq_ihi', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = ilo_eq_ihi;
	N = 4;
	H = makeMatrix( N, [
		[ 0, 0, 5.0 ],
		[ 0, 1, 3.0 ],
		[ 0, 2, 2.0 ],
		[ 0, 3, 1.0 ],
		[ 1, 1, 4.0 ],
		[ 1, 2, 3.0 ],
		[ 1, 3, 2.0 ],
		[ 2, 2, 3.0 ],
		[ 2, 3, 1.0 ],
		[ 3, 3, 7.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'none', N, 2, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 1 ], tc.wr2, 1e-14, 'wr2' );
	assertClose( WI[ 1 ], tc.wi2, 1e-14, 'wi2' );
});

test( 'dhseqr: complex_pairs_6x6', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = complex_pairs_6x6;
	N = 6;
	H = makeMatrix( N, [
		[ 0, 0, 1.0 ],
		[ 0, 1, -2.0 ],
		[ 0, 2, 1.0 ],
		[ 0, 3, 0.5 ],
		[ 0, 4, 0.1 ],
		[ 0, 5, 0.2 ], // eslint-disable-line max-len
		[ 1, 0, 2.0 ],
		[ 1, 1, 1.0 ],
		[ 1, 2, -1.0 ],
		[ 1, 3, 0.3 ],
		[ 1, 4, 0.4 ],
		[ 1, 5, 0.1 ], // eslint-disable-line max-len
		[ 2, 1, 1.5 ],
		[ 2, 2, 2.0 ],
		[ 2, 3, -1.0 ],
		[ 2, 4, 0.5 ],
		[ 2, 5, 0.3 ],
		[ 3, 2, 1.0 ],
		[ 3, 3, 3.0 ],
		[ 3, 4, -2.0 ],
		[ 3, 5, 0.4 ],
		[ 4, 3, 2.0 ],
		[ 4, 4, 1.0 ],
		[ 4, 5, -1.0 ],
		[ 5, 4, 1.0 ],
		[ 5, 5, 2.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: partial_range_6x6', function t() {
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = partial_range_6x6;
	N = 6;
	H = makeMatrix( N, [
		[ 0, 0, 10.0 ],
		[ 0, 1, 1.0 ],
		[ 0, 2, 2.0 ],
		[ 0, 3, 3.0 ],
		[ 0, 4, 4.0 ],
		[ 0, 5, 5.0 ],
		[ 1, 1, 4.0 ],
		[ 1, 2, 3.0 ],
		[ 1, 3, 1.0 ],
		[ 1, 4, 0.5 ],
		[ 1, 5, 0.1 ],
		[ 2, 1, 1.0 ],
		[ 2, 2, 3.0 ],
		[ 2, 3, 2.0 ],
		[ 2, 4, 1.0 ],
		[ 2, 5, 0.2 ],
		[ 3, 2, 0.5 ],
		[ 3, 3, 2.0 ],
		[ 3, 4, 1.5 ],
		[ 3, 5, 0.3 ],
		[ 4, 3, 0.25 ],
		[ 4, 4, 1.0 ],
		[ 4, 5, 0.4 ],
		[ 5, 5, 20.0 ]
	]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	Z = new Float64Array( N * N );
	info = dhseqr( 'schur', 'initialize', N, 2, 5, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});
