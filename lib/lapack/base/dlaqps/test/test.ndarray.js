/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import dlaqps from './../lib/ndarray.js';

// FIXTURES //

import basic_4x3_nb2 from './fixtures/basic_4x3_nb2.json' with { type: 'json' };
import rect_6x4_nb3 from './fixtures/rect_6x4_nb3.json' with { type: 'json' };
import nb_1 from './fixtures/nb_1.json' with { type: 'json' };
import offset_1 from './fixtures/offset_1.json' with { type: 'json' };
import collinear_norm_recomp from './fixtures/collinear_norm_recomp.json' with { type: 'json' };

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
* Set up a column-major matrix in a flat array.
* @param {number} LDA - leading dimension (total rows in storage)
* @param {number} M - rows used
* @param {number} N - cols used
* @param {Array} cols - array of columns, each column is an array of M values
* @returns {Float64Array} flat column-major array of size LDA*N
*/
function makeMatrix( LDA, M, N, cols ) {
	var out = new Float64Array( LDA * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ j * LDA + i ] = cols[ j ][ i ];
		}
	}
	return out;
}

/**
* Extract LDA*N elements from a flat array.
*/
function extractFlat( A, count ) {
	var result = [];
	var i;
	for ( i = 0; i < count; i++ ) {
		result.push( A[ i ] );
	}
	return result;
}

/**
* Compute column norms of an M-by-N column-major matrix starting from row startRow.
*/
function computeNorms( A, LDA, M, N, startRow ) {
	var norms = new Float64Array( N );
	var j;
	for ( j = 0; j < N; j++ ) {
		norms[ j ] = dnrm2( M - startRow, A, 1, j * LDA + startRow );
	}
	return norms;
}

// TESTS //

test( 'dlaqps: basic_4x3_nb2', function t() {
	var norms;
	var MAXN;
	var MAXM;
	var AUXV;
	var JPVT;
	var VN1;
	var VN2;
	var TAU;
	var tc;
	var kb;
	var A;
	var F;

	MAXN = 8;
	MAXM = 8;
	tc = basic_4x3_nb2;
	A = makeMatrix( MAXM, 4, 3, [
		[ 1, 2, 0, 1 ],
		[ 0, 1, 3, 2 ],
		[ 3, 0, 1, 2 ]
	]);
	JPVT = new Int32Array( [ 1, 2, 3, 0, 0, 0, 0, 0 ] );
	VN1 = new Float64Array( 8 );
	VN2 = new Float64Array( 8 );
	norms = computeNorms( A, MAXM, 4, 3, 0 );
	VN1[ 0 ] = norms[ 0 ];
	VN1[ 1 ] = norms[ 1 ];
	VN1[ 2 ] = norms[ 2 ];
	VN2[ 0 ] = norms[ 0 ];
	VN2[ 1 ] = norms[ 1 ];
	VN2[ 2 ] = norms[ 2 ];
	TAU = new Float64Array( 8 );
	AUXV = new Float64Array( 8 );
	F = new Float64Array( MAXN * 8 );
	kb = dlaqps( 4, 3, 0, 2, A, 1, MAXM, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, MAXN, 0 ); // eslint-disable-line max-len
	assert.equal( kb, tc.kb );
	assertArrayClose( extractFlat( A, MAXM * 3 ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.prototype.slice.call( TAU, 0, 3 ), tc.tau, 1e-13, 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( Array.prototype.slice.call( JPVT, 0, 3 ), tc.jpvt );
	assertArrayClose( extractFlat( F, MAXN * 3 ), tc.f, 1e-13, 'f' );
	assertArrayClose( Array.prototype.slice.call( VN1, 0, 3 ), tc.vn1, 1e-13, 'vn1' ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( VN2, 0, 3 ), tc.vn2, 1e-13, 'vn2' ); // eslint-disable-line max-len
});

test( 'dlaqps: rect_6x4_nb3', function t() {
	var norms;
	var MAXN;
	var MAXM;
	var AUXV;
	var JPVT;
	var VN1;
	var VN2;
	var TAU;
	var tc;
	var kb;
	var A;
	var F;
	var i;

	MAXN = 8;
	MAXM = 8;
	tc = rect_6x4_nb3;
	A = makeMatrix( MAXM, 6, 4, [
		[ 2, 1, 0, 3, 1, 0 ],
		[ 1, 0, 2, 1, 0, 3 ],
		[ 0, 3, 1, 0, 2, 1 ],
		[ 1, 2, 0, 1, 3, 0 ]
	]);
	JPVT = new Int32Array( [ 1, 2, 3, 4, 0, 0, 0, 0 ] );
	VN1 = new Float64Array( 8 );
	VN2 = new Float64Array( 8 );
	norms = computeNorms( A, MAXM, 6, 4, 0 );
	for ( i = 0; i < 4; i++ ) { VN1[ i ] = norms[ i ]; VN2[ i ] = norms[ i ]; }
	TAU = new Float64Array( 8 );
	AUXV = new Float64Array( 8 );
	F = new Float64Array( MAXN * 8 );
	kb = dlaqps( 6, 4, 0, 3, A, 1, MAXM, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, MAXN, 0 ); // eslint-disable-line max-len
	assert.equal( kb, tc.kb );
	assertArrayClose( extractFlat( A, MAXM * 4 ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.prototype.slice.call( TAU, 0, 4 ), tc.tau, 1e-13, 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( Array.prototype.slice.call( JPVT, 0, 4 ), tc.jpvt );
});

test( 'dlaqps: nb_1', function t() {
	var norms;
	var MAXN;
	var MAXM;
	var AUXV;
	var JPVT;
	var VN1;
	var VN2;
	var TAU;
	var tc;
	var kb;
	var A;
	var F;
	var i;

	MAXN = 8;
	MAXM = 8;
	tc = nb_1;
	A = makeMatrix( MAXM, 3, 3, [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 0, 1, 2 ]
	]);
	JPVT = new Int32Array( [ 1, 2, 3, 0, 0, 0, 0, 0 ] );
	VN1 = new Float64Array( 8 );
	VN2 = new Float64Array( 8 );
	norms = computeNorms( A, MAXM, 3, 3, 0 );
	for ( i = 0; i < 3; i++ ) { VN1[ i ] = norms[ i ]; VN2[ i ] = norms[ i ]; }
	TAU = new Float64Array( 8 );
	AUXV = new Float64Array( 8 );
	F = new Float64Array( MAXN * 8 );
	kb = dlaqps( 3, 3, 0, 1, A, 1, MAXM, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, MAXN, 0 ); // eslint-disable-line max-len
	assert.equal( kb, tc.kb );
	assertArrayClose( extractFlat( A, MAXM * 3 ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.prototype.slice.call( TAU, 0, kb ), tc.tau.slice( 0, kb ), 1e-13, 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( Array.prototype.slice.call( JPVT, 0, 3 ), tc.jpvt );
});

test( 'dlaqps: offset_1', function t() {
	var norms;
	var MAXN;
	var MAXM;
	var AUXV;
	var JPVT;
	var VN1;
	var VN2;
	var TAU;
	var tc;
	var kb;
	var A;
	var F;
	var i;

	MAXN = 8;
	MAXM = 8;
	tc = offset_1;
	A = makeMatrix( MAXM, 4, 2, [
		[ 5, 0, 0, 0 ],
		[ 1, 2, 1, 3 ]
	]);
	JPVT = new Int32Array( [ 1, 2, 0, 0, 0, 0, 0, 0 ] );
	VN1 = new Float64Array( 8 );
	VN2 = new Float64Array( 8 );
	norms = computeNorms( A, MAXM, 4, 2, 1 );
	for ( i = 0; i < 2; i++ ) { VN1[ i ] = norms[ i ]; VN2[ i ] = norms[ i ]; }
	TAU = new Float64Array( 8 );
	AUXV = new Float64Array( 8 );
	F = new Float64Array( MAXN * 8 );
	kb = dlaqps( 4, 2, 1, 2, A, 1, MAXM, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, MAXN, 0 ); // eslint-disable-line max-len
	assert.equal( kb, tc.kb );
	assertArrayClose( extractFlat( A, MAXM * 2 ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.prototype.slice.call( TAU, 0, 2 ), tc.tau, 1e-13, 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( Array.prototype.slice.call( JPVT, 0, 2 ), tc.jpvt );
});

test( 'dlaqps: collinear_norm_recomp', function t() {
	var norms;
	var MAXN;
	var MAXM;
	var AUXV;
	var JPVT;
	var VN1;
	var VN2;
	var TAU;
	var tc;
	var kb;
	var A;
	var F;
	var i;

	MAXN = 8;
	MAXM = 8;
	tc = collinear_norm_recomp;
	A = makeMatrix( MAXM, 6, 3, [
		[ 1, 2, 3, 4, 5, 6 ],
		[ 1, 2, 3, 4, 5, 6 + 1e-10 ],
		[ 1, 2, 3, 4, 5 + 1e-10, 6 ]
	]);
	JPVT = new Int32Array( [ 1, 2, 3, 0, 0, 0, 0, 0 ] );
	VN1 = new Float64Array( 8 );
	VN2 = new Float64Array( 8 );
	norms = computeNorms( A, MAXM, 6, 3, 0 );
	for ( i = 0; i < 3; i++ ) { VN1[ i ] = norms[ i ]; VN2[ i ] = norms[ i ]; }
	TAU = new Float64Array( 8 );
	AUXV = new Float64Array( 8 );
	F = new Float64Array( MAXN * 8 );
	kb = dlaqps( 6, 3, 0, 2, A, 1, MAXM, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, MAXN, 0 ); // eslint-disable-line max-len
	assert.equal( kb, tc.kb );
	assertArrayClose( extractFlat( A, MAXM * 3 ), tc.a, 1e-13, 'a' );
	assertArrayClose( Array.prototype.slice.call( TAU, 0, kb ), tc.tau.slice( 0, kb ), 1e-13, 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( Array.prototype.slice.call( JPVT, 0, 3 ), tc.jpvt );
	assertArrayClose( Array.prototype.slice.call( VN1, 0, 3 ), tc.vn1, 1e-10, 'vn1' ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( VN2, 0, 3 ), tc.vn2, 1e-10, 'vn2' ); // eslint-disable-line max-len
});
