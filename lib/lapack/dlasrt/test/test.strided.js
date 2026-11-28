/* eslint-disable no-restricted-syntax */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasrt from './../lib/index.js';


// FUNCTIONS //

/**
* AssertArrayEqual.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {string} msg - assertion message
*/
function assertArrayEqual( actual, expected, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.equal( actual[i], expected[i], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dlasrt: main export is a function', function t() {
	assert.strictEqual( typeof dlasrt, 'function' );
});

test( 'dlasrt: attached to the main export is an `strided` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasrt.strided, 'function' );
});

test( 'dlasrt.strided sorts in increasing order', function t() {

	const d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	const expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.strided( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'increasing' );
});

test( 'dlasrt.strided sorts in decreasing order', function t() {

	const d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	const expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.strided( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'decreasing' );
});

test( 'dlasrt.strided returns 0 on success', function t() {

	const d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	const info = dlasrt.strided( 'increasing', 3, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 on success' );
});

test( 'dlasrt.strided throws for invalid id', function t() {
	let d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.strided( 'X', 3, d, 1, 0 );
	}, TypeError, 'throws for invalid id' );
});

test( 'dlasrt.strided throws for negative N', function t() {
	let d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.strided( 'increasing', -1, d, 1, 0 );
	}, RangeError, 'throws for negative N' );
});

test( 'dlasrt.strided handles N=0 (quick return)', function t() {

	const d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	const info = dlasrt.strided( 'increasing', 0, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 for N=0' );
	assertArrayEqual( d, [ 3.0, 1.0, 2.0 ], 'unchanged for N=0' );
});

test( 'dlasrt.strided handles N=1 (quick return)', function t() {

	const d = new Float64Array( [ 42.0 ] );
	const info = dlasrt.strided( 'increasing', 1, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 for N=1' );
	assertArrayEqual( d, [ 42.0 ], 'unchanged for N=1' );
});

test( 'dlasrt.strided handles already sorted array (increasing)', function t() {

	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	const expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.strided( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'already sorted increasing' );
});

test( 'dlasrt.strided handles already sorted array (decreasing)', function t() {

	const d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	const expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.strided( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'already sorted decreasing' );
});

test( 'dlasrt.strided handles reverse sorted (increasing sort)', function t() {

	const d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	const expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.strided( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'reverse sorted increasing' );
});

test( 'dlasrt.strided handles reverse sorted (decreasing sort)', function t() {

	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	const expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.strided( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'reverse sorted decreasing' );
});

test( 'dlasrt.strided handles duplicate values (increasing)', function t() {

	const d = new Float64Array( [ 3.0, 1.0, 2.0, 1.0, 3.0, 2.0 ] );
	const expected = [ 1.0, 1.0, 2.0, 2.0, 3.0, 3.0 ];
	dlasrt.strided( 'increasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'duplicates increasing' );
});

test( 'dlasrt.strided handles duplicate values (decreasing)', function t() {

	const d = new Float64Array( [ 3.0, 1.0, 2.0, 1.0, 3.0, 2.0 ] );
	const expected = [ 3.0, 3.0, 2.0, 2.0, 1.0, 1.0 ];
	dlasrt.strided( 'decreasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'duplicates decreasing' );
});

test( 'dlasrt.strided handles all equal values', function t() {
	let d;

	d = new Float64Array( [ 7.0, 7.0, 7.0, 7.0 ] );
	const expected = [ 7.0, 7.0, 7.0, 7.0 ];
	dlasrt.strided( 'increasing', 4, d, 1, 0 );
	assertArrayEqual( d, expected, 'all equal increasing' );

	d = new Float64Array( [ 7.0, 7.0, 7.0, 7.0 ] );
	dlasrt.strided( 'decreasing', 4, d, 1, 0 );
	assertArrayEqual( d, expected, 'all equal decreasing' );
});

test( 'dlasrt.strided handles N=2', function t() {
	let d;

	d = new Float64Array( [ 9.0, 1.0 ] );
	dlasrt.strided( 'increasing', 2, d, 1, 0 );
	assertArrayEqual( d, [ 1.0, 9.0 ], 'N=2 increasing' );

	d = new Float64Array( [ 1.0, 9.0 ] );
	dlasrt.strided( 'decreasing', 2, d, 1, 0 );
	assertArrayEqual( d, [ 9.0, 1.0 ], 'N=2 decreasing' );
});

test( 'dlasrt.strided supports offset parameter', function t() {

	// Sort only elements starting at index 2
	const d = new Float64Array( [ 99.0, 88.0, 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	const expected = [ 99.0, 88.0, 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.strided( 'increasing', 5, d, 1, 2 );
	assertArrayEqual( d, expected, 'offset=2 increasing' );
});

test( 'dlasrt.strided supports stride parameter', function t() {

	// Sort every other element: indices 0, 2, 4
	const d = new Float64Array( [ 5.0, 99.0, 1.0, 88.0, 3.0, 77.0 ] );
	const expected = [ 1.0, 99.0, 3.0, 88.0, 5.0, 77.0 ];
	dlasrt.strided( 'increasing', 3, d, 2, 0 );
	assertArrayEqual( d, expected, 'stride=2 increasing' );
});

test( 'dlasrt.strided supports stride and offset together', function t() {

	// Sort every other element starting at index 1: indices 1, 3, 5
	const d = new Float64Array( [ 99.0, 5.0, 88.0, 1.0, 77.0, 3.0 ] );
	const expected = [ 99.0, 1.0, 88.0, 3.0, 77.0, 5.0 ];
	dlasrt.strided( 'increasing', 3, d, 2, 1 );
	assertArrayEqual( d, expected, 'stride=2 offset=1 increasing' );
});

test( 'dlasrt.strided handles negative values', function t() {

	const d = new Float64Array( [ -1.0, -5.0, -3.0, -2.0, -4.0 ] );
	const expected = [ -5.0, -4.0, -3.0, -2.0, -1.0 ];
	dlasrt.strided( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'negatives increasing' );
});

test( 'dlasrt.strided handles mixed positive and negative values', function t() { // eslint-disable-line max-len

	const d = new Float64Array( [ 3.0, -1.0, 0.0, -5.0, 2.0, -3.0 ] );
	const expected = [ -5.0, -3.0, -1.0, 0.0, 2.0, 3.0 ];
	dlasrt.strided( 'increasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'mixed increasing' );
});

test( 'dlasrt.strided handles large array (triggers quicksort, N > 20)', function t() { // eslint-disable-line max-len
	let sorted, i;

	// Create array of 100 elements in descending order
	const d = new Float64Array( 100 );
	for ( i = 0; i < 100; i++ ) {
		d[ i ] = 100.0 - i;
	}
	dlasrt.strided( 'increasing', 100, d, 1, 0 );

	// Verify sorted in increasing order
	sorted = true;
	for ( i = 1; i < 100; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'large array sorted increasing' );
	assert.equal( d[ 0 ], 1.0, 'first element' );
	assert.equal( d[ 99 ], 100.0, 'last element' );
});

test( 'dlasrt.strided handles large array decreasing sort', function t() {
	let sorted, i;

	// Create array of 100 elements in ascending order
	const d = new Float64Array( 100 );
	for ( i = 0; i < 100; i++ ) {
		d[ i ] = i + 1.0;
	}
	dlasrt.strided( 'decreasing', 100, d, 1, 0 );

	// Verify sorted in decreasing order
	sorted = true;
	for ( i = 1; i < 100; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'large array sorted decreasing' );
	assert.equal( d[ 0 ], 100.0, 'first element' );
	assert.equal( d[ 99 ], 1.0, 'last element' );
});

test( 'dlasrt.strided handles large random array', function t() {
	let sorted, seed, i;

	// Deterministic pseudo-random using simple LCG
	seed = 12345;
	const d = new Float64Array( 200 );
	for ( i = 0; i < 200; i++ ) {
		seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
		d[ i ] = ( seed / 0x7fffffff ) * 200.0 - 100.0;
	}

	dlasrt.strided( 'increasing', 200, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 200; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'random array sorted increasing' );
});

test( 'dlasrt.strided handles large random array (decreasing)', function t() {
	let sorted, seed, i;

	seed = 54321;
	const d = new Float64Array( 200 );
	for ( i = 0; i < 200; i++ ) {
		seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
		d[ i ] = ( seed / 0x7fffffff ) * 200.0 - 100.0;
	}

	dlasrt.strided( 'decreasing', 200, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 200; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'random array sorted decreasing' );
});

test( 'dlasrt.strided only sorts first N elements', function t() {

	const d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	dlasrt.strided( 'increasing', 3, d, 1, 0 );

	// First 3 elements sorted, rest unchanged
	assertArrayEqual( d, [ 1.0, 3.0, 5.0, 4.0, 2.0 ], 'partial sort N=3' );
});

test( 'dlasrt.strided rejects old single-char id values', function t() {
	let d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.strided( 'I', 3, d, 1, 0 );
	}, TypeError, 'rejects uppercase I' );

	assert.throws( function throws() {
		dlasrt.strided( 'D', 3, d, 1, 0 );
	}, TypeError, 'rejects uppercase D' );

	assert.throws( function throws() {
		dlasrt.strided( 'i', 3, d, 1, 0 );
	}, TypeError, 'rejects lowercase i' );

	assert.throws( function throws() {
		dlasrt.strided( 'd', 3, d, 1, 0 );
	}, TypeError, 'rejects lowercase d' );
});

test( 'dlasrt.strided handles large array with many duplicates', function t() {
	let sorted, i;

	const d = new Float64Array( 50 );
	for ( i = 0; i < 50; i++ ) {
		d[ i ] = ( i % 3 ) * 1.0; // values cycle: 0, 1, 2, 0, 1, 2, ...
	}

	dlasrt.strided( 'increasing', 50, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 50; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'many duplicates sorted increasing' );
});

test( 'dlasrt.strided handles large array with many duplicates (decreasing)', function t() { // eslint-disable-line max-len
	let sorted, i;

	const d = new Float64Array( 50 );
	for ( i = 0; i < 50; i++ ) {
		d[ i ] = ( i % 3 ) * 1.0;
	}

	dlasrt.strided( 'decreasing', 50, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 50; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'many duplicates sorted decreasing' );
});

test( 'dlasrt.strided handles exactly SELECT+1 (21) elements', function t() {
	let sorted, i;

	// 21 elements: triggers quicksort path (endd - start = 20 > SELECT=20 is false, so 21 elements = endd-start=20 which is exactly SELECT, meaning it still uses insertion sort) // eslint-disable-line max-len

	// Use 22 elements to trigger quicksort
	const d = new Float64Array( 22 );
	for ( i = 0; i < 22; i++ ) {
		d[ i ] = 22.0 - i;
	}

	dlasrt.strided( 'increasing', 22, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 22; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, '22 elements sorted increasing' );
	assert.equal( d[ 0 ], 1.0, 'first' );
	assert.equal( d[ 21 ], 22.0, 'last' );
});

test( 'dlasrt.strided handles exactly 21 elements (boundary for quicksort)', function t() { // eslint-disable-line max-len
	let sorted, i;

	// 21 elements: endd-start = 20 = SELECT, uses insertion sort
	const d = new Float64Array( 21 );
	for ( i = 0; i < 21; i++ ) {
		d[ i ] = 21.0 - i;
	}

	dlasrt.strided( 'increasing', 21, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 21; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, '21 elements sorted increasing' );
});

test( 'dlasrt.strided handles exactly 21 elements decreasing', function t() {
	let sorted, i;

	const d = new Float64Array( 21 );
	for ( i = 0; i < 21; i++ ) {
		d[ i ] = i + 1.0;
	}

	dlasrt.strided( 'decreasing', 21, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 21; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, '21 elements sorted decreasing' );
});
