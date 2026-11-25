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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	const A = new Float64Array( N * N );
	let k;
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
	const result = [];
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dhseqr: eigenvalues_only_6x6', function t() {

	const tc = eigenvalues_only_6x6;
	const N = 6;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'eigenvalues', 'none', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	const actualWR = toArray( WR ).sort( function ( a, b ) { return a - b; } );
	const expectedWR = tc.wr.slice().sort( function ( a, b ) { return a - b; } );
	assertArrayClose( actualWR, expectedWR, 1e-12, 'wr' );
	const actualWI = toArray( WI ).sort( function ( a, b ) { return a - b; } );
	const expectedWI = tc.wi.slice().sort( function ( a, b ) { return a - b; } );
	assertArrayClose( actualWI, expectedWI, 1e-12, 'wi' );
});

test( 'dhseqr: schur_with_z_init_4x4', function t() {

	const tc = schur_with_z_init_4x4;
	const N = 4;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: schur_with_z_update_4x4', function t() {

	const tc = schur_with_z_update_4x4;
	const N = 4;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = makeMatrix( N, [
		[ 0, 0, 1.0 ], [ 1, 1, 1.0 ], [ 2, 2, 1.0 ], [ 3, 3, 1.0 ]
	]);
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'update', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: schur_no_z_4x4', function t() {

	const tc = schur_no_z_4x4;
	const N = 4;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'none', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
});

test( 'dhseqr: n0', function t() {

	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const H = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dhseqr( 'schur', 'initialize', 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dhseqr: n1', function t() {

	const tc = n1;
	const N = 1;
	const H = new Float64Array( [ 7.0 ] );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.wr1, 1e-14, 'wr1' );
	assertClose( WI[ 0 ], tc.wi1, 1e-14, 'wi1' );
	assertClose( H[ 0 ], tc.h11, 1e-14, 'h11' );
	assertClose( Z[ 0 ], tc.z11, 1e-14, 'z11' );
});

test( 'dhseqr: n2_complex', function t() {

	const tc = n2_complex;
	const N = 2;
	const H = makeMatrix( N, [
		[ 0, 0, 0.0 ],
		[ 0, 1, -2.0 ],
		[ 1, 0, 1.0 ],
		[ 1, 1, 0.0 ]
	]);
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: ilo_eq_ihi', function t() {

	const tc = ilo_eq_ihi;
	const N = 4;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'none', N, 2, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 1 ], tc.wr2, 1e-14, 'wr2' );
	assertClose( WI[ 1 ], tc.wi2, 1e-14, 'wi2' );
});

test( 'dhseqr: complex_pairs_6x6', function t() {

	const tc = complex_pairs_6x6;
	const N = 6;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

test( 'dhseqr: partial_range_6x6', function t() {

	const tc = partial_range_6x6;
	const N = 6;
	const H = makeMatrix( N, [
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
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );
	const info = dhseqr( 'schur', 'initialize', N, 2, 5, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.wr, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ), tc.wi, 1e-12, 'wi' );
	assertArrayClose( matrixToArray( H, N ), tc.h, 1e-12, 'h' );
	assertArrayClose( matrixToArray( Z, N ), tc.z, 1e-12, 'z' );
});

/**
* Builds an N-by-N column-major Hessenberg matrix whose leading 3-by-3 block contains a NaN (so `dlahqr` cannot converge on it) and whose trailing block is decoupled (`H(4,3) = 0`).
*
* For N = 5 the trailing 2-by-2 block is `[[4,1],[-2,4]]` (eigenvalues `4 +/- i*sqrt(2)`); otherwise it is the symmetric tridiagonal Toeplitz matrix `tri(1,4,1)` of order N-3 (eigenvalues `4 + 2*cos(k*pi/(N-2))`).
*
* @private
* @param {integer} N - order
* @returns {Float64Array} matrix
*/
function nanLeadingBlock( N ) {
	const H = new Float64Array( N * N );
	let i;
	let j;

	H[ 0 ] = 1.0;
	H[ 1 ] = NaN;
	H[ N ] = 2.0;
	H[ N + 1 ] = 3.0;
	H[ N + 2 ] = 1.0;
	H[ ( 2 * N ) ] = 1.0;
	H[ ( 2 * N ) + 1 ] = 1.0;
	H[ ( 2 * N ) + 2 ] = 2.0;
	for ( j = 3; j < N; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			H[ i + ( j * N ) ] = 1.0;
		}
	}
	if ( N === 5 ) {
		H[ 3 + ( 3 * N ) ] = 4.0;
		H[ 3 + ( 4 * N ) ] = 1.0;
		H[ 4 + ( 3 * N ) ] = -2.0;
		H[ 4 + ( 4 * N ) ] = 4.0;
		return H;
	}
	for ( i = 3; i < N; i++ ) {
		H[ i + ( i * N ) ] = 4.0;
		if ( i < N - 1 ) {
			H[ i + ( ( i + 1 ) * N ) ] = 1.0;
			H[ i + 1 + ( i * N ) ] = 1.0;
		}
	}
	return H;
}

test( 'dhseqr: dlahqr non-convergence falls back to dlaqr0 on an embedded NL-by-NL matrix (N < NL)', function t() {
	const N = 5;
	const H = nanLeadingBlock( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N );

	const info = dhseqr( 'eigenvalues', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len

	// Reference LAPACK 3.12.0 returns INFO = 3: the NaN-contaminated leading 3-by-3 block cannot converge.
	assert.equal( info, 3, 'info' );

	// Eigenvalues INFO+1:IHI are those successfully computed (the decoupled trailing block):
	assertClose( WR[ 3 ], 4.0, 1e-14, 'wr[3]' );
	assertClose( WR[ 4 ], 4.0, 1e-14, 'wr[4]' );
	assertClose( WI[ 3 ], Math.SQRT2, 1e-14, 'wi[3]' );
	assertClose( WI[ 4 ], -Math.SQRT2, 1e-14, 'wi[4]' );
});

test( 'dhseqr: dlahqr non-convergence falls back to dlaqr0 with the caller workspace (NL <= N <= NMIN)', function t() {
	const N = 50;
	const H = nanLeadingBlock( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const WORK = new Float64Array( N * N );
	const expected = [];
	let actual;
	let k;

	const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len

	// Reference LAPACK 3.12.0 returns INFO = 3:
	assert.equal( info, 3, 'info' );

	// Converged eigenvalues are those of tri(1,4,1) of order N-3:
	for ( k = 1; k <= N - 3; k++ ) {
		expected.push( 4.0 + ( 2.0 * Math.cos( k * Math.PI / ( N - 2 ) ) ) );
	}
	expected.sort( ascending );
	actual = toArray( WR ).slice( 3 ).sort( ascending );
	assertArrayClose( actual, expected, 1e-12, 'wr' );
	assertArrayClose( toArray( WI ).slice( 3 ), new Array( N - 3 ).fill( 0.0 ), 0.0, 'wi' );

	// Entries below the first subdiagonal are cleaned up on exit:
	for ( k = 2; k < N; k++ ) {
		assert.equal( H[ k ], 0.0, 'H(' + ( k + 1 ) + ',1)' );
	}

	/**
	* Ascending comparator.
	*
	* @private
	* @param {number} a - first value
	* @param {number} b - second value
	* @returns {number} comparison result
	*/
	function ascending( a, b ) {
		return a - b;
	}
});

test( 'dhseqr: minimum WORK covers dlaqr0\'s blocked AED path (33*JW+2080 for a reachable window JW > 32, ticket 0096)', function t() {
	let r;
	function cyclic( N ) {
		// Cyclic shift: eigenvalues are the N-th roots of unity, so AED stalls and the window grows past 32 with many undeflated shifts.
		const H = new Float64Array( N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		return H;
	}
	function run( N, lwork, zero ) {
		const H = ( zero ) ? new Float64Array( N * N ) : cyclic( N );
		const Z = new Float64Array( N * N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const info = dhseqr( 'schur', 'initialize', N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, Z, 1, N, 0, new Float64Array( lwork ), 1, 0 );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( H ), Array.from( Z ) ];
	}
	const N = 300; // N > NMIN = 75 hands WORK to dlaqr0, whose window reaches JW >= 34 with >= 34 undeflated shifts
	r = run( N, 5347 ); // 33*floor((N-1)/3) + 2080
	assert.equal( r[ 0 ], 0, 'info' );
	assert.ok( r[ 1 ].every( Number.isFinite ), 'finite eigenvalues' );
	assert.deepEqual( r, run( N, 100 * N ) );

	// (H = 0 below, so that on the old code the accepted call returns at once.)
	// The old minimum `max(1,N)` was accepted, overran WORK in dlaqr3 and never converged (hung > 120 s):
	assert.throws( function throws() {
		run( N, N, true );
	}, /work array must have at least 5347 elements/ );
	assert.throws( function throws() {
		run( N, 5346, true );
	}, RangeError );

	// A narrow active block keeps the window small, so max(1,N) suffices there:
	assert.equal( dhseqr( 'eigenvalues', 'none', N, 1, 30, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( N ), 1, 0 ), 0 );
});
