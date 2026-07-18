/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqgb from './../lib/ndarray.js';

// FIXTURES //

import no_equil from './fixtures/no_equil.json' with { type: 'json' };
import row_equil from './fixtures/row_equil.json' with { type: 'json' };
import col_equil from './fixtures/col_equil.json' with { type: 'json' };
import both_equil from './fixtures/both_equil.json' with { type: 'json' };
import small_amax from './fixtures/small_amax.json' with { type: 'json' };
import nonsquare_both from './fixtures/nonsquare_both.json' with { type: 'json' };

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

// 4x4 band matrix with kl=1, ku=2, ldab=4
// Band storage (column-major): AB is ldab x n = 4x4 = 16 complex entries
const AB_DATA = [
	// Col 1 (j=0): valid rows i from max(0,0-2)=0 to min(3,0+1)=1
	0.0,
	0.0,    // AB(0,0) - unused
	0.0,
	0.0,    // AB(1,0) - unused
	1.0,
	0.5,    // AB(2,0) = A(0,0)
	2.0,
	-1.0,   // AB(3,0) = A(1,0)

	// Col 2 (j=1): valid rows i from max(0,1-2)=0 to min(3,1+1)=2
	0.0,
	0.0,    // AB(0,1) - unused
	3.0,
	1.0,    // AB(1,1) = A(0,1)
	4.0,
	2.0,    // AB(2,1) = A(1,1)
	5.0,
	-0.5,   // AB(3,1) = A(2,1)

	// Col 3 (j=2): valid rows i from max(0,2-2)=0 to min(3,2+1)=3
	6.0,
	0.3,    // AB(0,2) = A(0,2)
	7.0,
	-0.2,   // AB(1,2) = A(1,2)
	8.0,
	1.5,    // AB(2,2) = A(2,2)
	9.0,
	0.1,    // AB(3,2) = A(3,2)

	// Col 4 (j=3): valid rows i from max(0,3-2)=1 to min(3,3+1)=3
	10.0,
	-0.4,  // AB(0,3) = A(1,3)
	11.0,
	0.7,   // AB(1,3) = A(2,3)
	12.0,
	-1.0,  // AB(2,3) = A(3,3)
	0.0,
	0.0     // AB(3,3) - unused
];

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

test( 'zlaqgb: no_equil', function t() {

	const tc = no_equil;
	const AB = new Complex128Array( AB_DATA.slice() );
	const r = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const equed = zlaqgb( 4, 4, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 12.0 );
	assert.equal( equed, 'none' );
	const ABv = reinterpret( AB, 0 );
	assertArrayClose( toArray( ABv ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqgb: row_equil', function t() {

	const tc = row_equil;
	const AB = new Complex128Array( AB_DATA.slice() );
	const r = new Float64Array( [ 0.5, 2.0, 1.5, 0.25 ] );
	const c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const equed = zlaqgb( 4, 4, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 12.0 );
	assert.equal( equed, 'row' );
	const ABv = reinterpret( AB, 0 );
	assertArrayClose( toArray( ABv ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqgb: col_equil', function t() {

	const tc = col_equil;
	const AB = new Complex128Array( AB_DATA.slice() );
	const r = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const c = new Float64Array( [ 0.5, 2.0, 1.5, 0.25 ] );
	const equed = zlaqgb( 4, 4, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 1.0, 0.01, 12.0 );
	assert.equal( equed, 'column' );
	const ABv = reinterpret( AB, 0 );
	assertArrayClose( toArray( ABv ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqgb: both_equil', function t() {

	const tc = both_equil;
	const AB = new Complex128Array( AB_DATA.slice() );
	const r = new Float64Array( [ 0.5, 2.0, 1.5, 0.25 ] );
	const c = new Float64Array( [ 0.5, 2.0, 1.5, 0.25 ] );
	const equed = zlaqgb( 4, 4, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 12.0 );
	assert.equal( equed, 'both' );
	const ABv = reinterpret( AB, 0 );
	assertArrayClose( toArray( ABv ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqgb: m_zero', function t() {

	const AB = new Complex128Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const equed = zlaqgb( 0, 4, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 12.0 );
	assert.equal( equed, 'none' );
});

test( 'zlaqgb: n_zero', function t() {

	const AB = new Complex128Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const equed = zlaqgb( 4, 0, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 12.0 );
	assert.equal( equed, 'none' );
});

test( 'zlaqgb: small_amax triggers row equilibration path', function t() {

	const AB = new Complex128Array([
		1e-200,
		0.0,
		1e-200,
		0.0,
		1e-200,
		0.0,
		1e-200,
		0.0
	]);
	const r = new Float64Array( [ 1.0, 1.0 ] );
	const c = new Float64Array( [ 1.0, 1.0 ] );
	const equed = zlaqgb( 2, 2, 1, 0, AB, 1, 2, 0, r, 1, 0, c, 1, 0, 1.0, 1.0, 1e-200 );
	const equedMap = {
		'N': 'none',
		'R': 'row',
		'C': 'column',
		'B': 'both'
	};
	const tc = small_amax;
	assert.equal( equed, equedMap[ tc.equed ] || tc.equed );
});

test( 'zlaqgb: nonsquare_both', function t() {

	const tc = nonsquare_both;
	const AB = new Complex128Array([
		// Col 1 (j=0)
		0.0,
		0.0,    // AB(0,0) - unused (i would be j-ku = -1)
		1.0,
		0.5,    // AB(1,0) = A(0,0)
		2.0,
		-0.3,   // AB(2,0) = A(1,0)

		// Col 2 (j=1)
		3.0,
		1.0,    // AB(0,1) = A(0,1)
		4.0,
		-1.0,   // AB(1,1) = A(1,1)
		5.0,
		0.2,    // AB(2,1) = A(2,1)

		// Col 3 (j=2)
		6.0,
		0.7,    // AB(0,2) = A(1,2)
		7.0,
		-0.5,   // AB(1,2) = A(2,2)
		8.0,
		1.0,    // AB(2,2) - unused (i=3 >= M=3)

		// Col 4 (j=3)
		0.0,
		0.0,    // AB(0,3) = A(2,3)
		0.0,
		0.0,    // AB(1,3) - i=3 >= M=3
		9.0,
		-0.1,   // AB(2,3) - unused

		// Col 5 (j=4)
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	const r = new Float64Array( [ 0.5, 2.0, 1.5 ] );
	const c = new Float64Array( [ 0.5, 2.0, 1.5, 0.25, 3.0 ] );
	const equed = zlaqgb( 3, 5, 1, 1, AB, 1, 3, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 9.0 );
	assert.equal( equed, 'both' );
	const ABv = reinterpret( AB, 0 );
	assertArrayClose( toArray( ABv ), tc.ab, 1e-14, 'ab' );
});
