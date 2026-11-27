/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrtri from './../lib/ndarray.js';
import dtrti2 from './../../dtrti2/lib/base.js';

// FIXTURES //

import upper_nonunit_3 from './fixtures/upper_nonunit_3.json' with { type: 'json' };
import lower_nonunit_3 from './fixtures/lower_nonunit_3.json' with { type: 'json' };
import upper_nonunit_4 from './fixtures/upper_nonunit_4.json' with { type: 'json' };
import lower_nonunit_4 from './fixtures/lower_nonunit_4.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import upper_5x5 from './fixtures/upper_5x5.json' with { type: 'json' };
import lower_5x5 from './fixtures/lower_5x5.json' with { type: 'json' };

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

// TESTS //

test( 'dtrtri: upper, non-unit, 3x3', function t() {

	const tc = upper_nonunit_3;
	const A = new Float64Array( [ 2, 0, 0, 1, 4, 0, 3, 5, 6 ] );
	const info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower, non-unit, 3x3', function t() {

	const tc = lower_nonunit_3;
	const A = new Float64Array( [ 2, 1, 3, 0, 4, 5, 0, 0, 6 ] );
	const info = dtrtri( 'lower', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: upper, non-unit, 4x4', function t() {

	const tc = upper_nonunit_4;
	const A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	]);
	const info = dtrtri( 'upper', 'non-unit', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower, non-unit, 4x4', function t() {

	const tc = lower_nonunit_4;
	const A = new Float64Array([
		1,
		2,
		3,
		4,
		0,
		5,
		6,
		7,
		0,
		0,
		8,
		9,
		0,
		0,
		0,
		10
	]);
	const info = dtrtri( 'lower', 'non-unit', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: N=0', function t() {
	const info = dtrtri( 'upper', 'non-unit', 0, new Float64Array( 0 ), 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtrtri: singular (zero diagonal)', function t() {

	const tc = singular;
	const A = new Float64Array( [ 2, 0, 0, 3, 0, 0, 0, 0, 6 ] );
	const info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'dtrtri: upper, unit diag, 3x3', function t() {

	const tc = upper_unit;
	const A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 3, 5, 99 ] );
	const info = dtrtri( 'upper', 'unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: identity 3x3', function t() {

	const tc = identity;
	const A = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	const info = dtrtri( 'upper', 'non-unit', 3, A, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: N=1 (unblocked path)', function t() {

	const A = new Float64Array( [ 4 ] );
	const info = dtrtri( 'upper', 'non-unit', 1, A, 1, 1, 0 );
	assert.equal( info, 0 );
	assertClose( A[ 0 ], 0.25, 1e-14, 'a[0]' );
});

test( 'dtrtri: upper 5x5', function t() {

	const tc = upper_5x5;
	const A = new Float64Array([
		2,
		0,
		0,
		0,
		0,
		1,
		4,
		0,
		0,
		0,
		3,
		1,
		5,
		0,
		0,
		2,
		3,
		1,
		6,
		0,
		1,
		2,
		4,
		1,
		3
	]);
	const info = dtrtri( 'upper', 'non-unit', 5, A, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

test( 'dtrtri: lower 5x5', function t() {

	const tc = lower_5x5;
	const A = new Float64Array([
		2,
		1,
		3,
		2,
		1,
		0,
		4,
		1,
		3,
		2,
		0,
		0,
		5,
		1,
		4,
		0,
		0,
		0,
		6,
		1,
		0,
		0,
		0,
		0,
		3
	]);
	const info = dtrtri( 'lower', 'non-unit', 5, A, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
});

/**
* Returns an N-by-N column-major triangular test matrix (opposite triangle zero).
*
* @private
* @param {string} uplo - triangle to fill
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} matrix
*/
function triangularInput( uplo, N ) {
	let i, j;
	const A = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( ( uplo === 'upper' ) ? i <= j : i >= j ) {
				A[ i + ( j * N ) ] = Math.sin( ( i * N ) + j + 1 ) + ( ( i === j ) ? 3.0 : 0.0 );
			}
		}
	}
	return A;
}

test( 'dtrtri: N in (old NB, 64] takes the unblocked path, like the reference (ILAENV NB = 64)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ 'non-unit', 'unit' ].forEach( function eachDiag( diag ) {
			[ 40, 64 ].forEach( function eachN( N ) {
				const A = triangularInput( uplo, N );
				const B = triangularInput( uplo, N );
				const info = dtrtri( uplo, diag, N, A, 1, N, 0 );
				dtrti2( uplo, diag, N, B, 1, N, 0 );
				assert.equal( info, 0 );
				assert.deepStrictEqual( A, B, uplo + ' ' + diag + ' N=' + N );
			});
		});
	});
});
