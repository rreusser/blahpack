/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.equal( actual[i], expected[i], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dlasrt: main export is a function', function t() {
	assert.strictEqual( typeof dlasrt, 'function' );
});

test( 'dlasrt: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasrt.ndarray, 'function' );
});

test( 'dlasrt.ndarray sorts in increasing order', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.ndarray( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'increasing' );
});

test( 'dlasrt.ndarray sorts in decreasing order', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.ndarray( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'decreasing' );
});

test( 'dlasrt.ndarray returns 0 on success', function t() {
	var info;
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	info = dlasrt.ndarray( 'increasing', 3, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 on success' );
});

test( 'dlasrt.ndarray throws for invalid id', function t() {
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.ndarray( 'X', 3, d, 1, 0 );
	}, TypeError, 'throws for invalid id' );
});

test( 'dlasrt.ndarray throws for negative N', function t() {
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.ndarray( 'increasing', -1, d, 1, 0 );
	}, RangeError, 'throws for negative N' );
});

test( 'dlasrt.ndarray handles N=0 (quick return)', function t() {
	var info;
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	info = dlasrt.ndarray( 'increasing', 0, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 for N=0' );
	assertArrayEqual( d, [ 3.0, 1.0, 2.0 ], 'unchanged for N=0' );
});

test( 'dlasrt.ndarray handles N=1 (quick return)', function t() {
	var info;
	var d;

	d = new Float64Array( [ 42.0 ] );
	info = dlasrt.ndarray( 'increasing', 1, d, 1, 0 );
	assert.equal( info, 0, 'returns 0 for N=1' );
	assertArrayEqual( d, [ 42.0 ], 'unchanged for N=1' );
});

test( 'dlasrt.ndarray handles already sorted array (increasing)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.ndarray( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'already sorted increasing' );
});

test( 'dlasrt.ndarray handles already sorted array (decreasing)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.ndarray( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'already sorted decreasing' );
});

test( 'dlasrt.ndarray handles reverse sorted (increasing sort)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 5.0, 4.0, 3.0, 2.0, 1.0 ] );
	expected = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.ndarray( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'reverse sorted increasing' );
});

test( 'dlasrt.ndarray handles reverse sorted (decreasing sort)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	expected = [ 5.0, 4.0, 3.0, 2.0, 1.0 ];
	dlasrt.ndarray( 'decreasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'reverse sorted decreasing' );
});

test( 'dlasrt.ndarray handles duplicate values (increasing)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0, 1.0, 3.0, 2.0 ] );
	expected = [ 1.0, 1.0, 2.0, 2.0, 3.0, 3.0 ];
	dlasrt.ndarray( 'increasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'duplicates increasing' );
});

test( 'dlasrt.ndarray handles duplicate values (decreasing)', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0, 1.0, 3.0, 2.0 ] );
	expected = [ 3.0, 3.0, 2.0, 2.0, 1.0, 1.0 ];
	dlasrt.ndarray( 'decreasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'duplicates decreasing' );
});

test( 'dlasrt.ndarray handles all equal values', function t() {
	var expected;
	var d;

	d = new Float64Array( [ 7.0, 7.0, 7.0, 7.0 ] );
	expected = [ 7.0, 7.0, 7.0, 7.0 ];
	dlasrt.ndarray( 'increasing', 4, d, 1, 0 );
	assertArrayEqual( d, expected, 'all equal increasing' );

	d = new Float64Array( [ 7.0, 7.0, 7.0, 7.0 ] );
	dlasrt.ndarray( 'decreasing', 4, d, 1, 0 );
	assertArrayEqual( d, expected, 'all equal decreasing' );
});

test( 'dlasrt.ndarray handles N=2', function t() {
	var d;

	d = new Float64Array( [ 9.0, 1.0 ] );
	dlasrt.ndarray( 'increasing', 2, d, 1, 0 );
	assertArrayEqual( d, [ 1.0, 9.0 ], 'N=2 increasing' );

	d = new Float64Array( [ 1.0, 9.0 ] );
	dlasrt.ndarray( 'decreasing', 2, d, 1, 0 );
	assertArrayEqual( d, [ 9.0, 1.0 ], 'N=2 decreasing' );
});

test( 'dlasrt.ndarray supports offset parameter', function t() {
	var expected;
	var d;

	// Sort only elements starting at index 2
	d = new Float64Array( [ 99.0, 88.0, 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	expected = [ 99.0, 88.0, 1.0, 2.0, 3.0, 4.0, 5.0 ];
	dlasrt.ndarray( 'increasing', 5, d, 1, 2 );
	assertArrayEqual( d, expected, 'offset=2 increasing' );
});

test( 'dlasrt.ndarray supports stride parameter', function t() {
	var expected;
	var d;

	// Sort every other element: indices 0, 2, 4
	d = new Float64Array( [ 5.0, 99.0, 1.0, 88.0, 3.0, 77.0 ] );
	expected = [ 1.0, 99.0, 3.0, 88.0, 5.0, 77.0 ];
	dlasrt.ndarray( 'increasing', 3, d, 2, 0 );
	assertArrayEqual( d, expected, 'stride=2 increasing' );
});

test( 'dlasrt.ndarray supports stride and offset together', function t() {
	var expected;
	var d;

	// Sort every other element starting at index 1: indices 1, 3, 5
	d = new Float64Array( [ 99.0, 5.0, 88.0, 1.0, 77.0, 3.0 ] );
	expected = [ 99.0, 1.0, 88.0, 3.0, 77.0, 5.0 ];
	dlasrt.ndarray( 'increasing', 3, d, 2, 1 );
	assertArrayEqual( d, expected, 'stride=2 offset=1 increasing' );
});

test( 'dlasrt.ndarray handles negative values', function t() {
	var expected;
	var d;

	d = new Float64Array( [ -1.0, -5.0, -3.0, -2.0, -4.0 ] );
	expected = [ -5.0, -4.0, -3.0, -2.0, -1.0 ];
	dlasrt.ndarray( 'increasing', 5, d, 1, 0 );
	assertArrayEqual( d, expected, 'negatives increasing' );
});

test( 'dlasrt.ndarray handles mixed positive and negative values', function t() { // eslint-disable-line max-len
	var expected;
	var d;

	d = new Float64Array( [ 3.0, -1.0, 0.0, -5.0, 2.0, -3.0 ] );
	expected = [ -5.0, -3.0, -1.0, 0.0, 2.0, 3.0 ];
	dlasrt.ndarray( 'increasing', 6, d, 1, 0 );
	assertArrayEqual( d, expected, 'mixed increasing' );
});

test( 'dlasrt.ndarray handles large array (triggers quicksort, N > 20)', function t() { // eslint-disable-line max-len
	var sorted;
	var d;
	var i;

	// Create array of 100 elements in descending order
	d = new Float64Array( 100 );
	for ( i = 0; i < 100; i++ ) {
		d[ i ] = 100.0 - i;
	}
	dlasrt.ndarray( 'increasing', 100, d, 1, 0 );

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

test( 'dlasrt.ndarray handles large array decreasing sort', function t() {
	var sorted;
	var d;
	var i;

	// Create array of 100 elements in ascending order
	d = new Float64Array( 100 );
	for ( i = 0; i < 100; i++ ) {
		d[ i ] = i + 1.0;
	}
	dlasrt.ndarray( 'decreasing', 100, d, 1, 0 );

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

test( 'dlasrt.ndarray handles large random array', function t() {
	var sorted;
	var seed;
	var d;
	var i;

	// Deterministic pseudo-random using simple LCG
	seed = 12345;
	d = new Float64Array( 200 );
	for ( i = 0; i < 200; i++ ) {
		seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
		d[ i ] = ( seed / 0x7fffffff ) * 200.0 - 100.0;
	}

	dlasrt.ndarray( 'increasing', 200, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 200; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'random array sorted increasing' );
});

test( 'dlasrt.ndarray handles large random array (decreasing)', function t() {
	var sorted;
	var seed;
	var d;
	var i;

	seed = 54321;
	d = new Float64Array( 200 );
	for ( i = 0; i < 200; i++ ) {
		seed = ( seed * 1103515245 + 12345 ) & 0x7fffffff;
		d[ i ] = ( seed / 0x7fffffff ) * 200.0 - 100.0;
	}

	dlasrt.ndarray( 'decreasing', 200, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 200; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'random array sorted decreasing' );
});

test( 'dlasrt.ndarray only sorts first N elements', function t() {
	var d;

	d = new Float64Array( [ 5.0, 3.0, 1.0, 4.0, 2.0 ] );
	dlasrt.ndarray( 'increasing', 3, d, 1, 0 );

	// First 3 elements sorted, rest unchanged
	assertArrayEqual( d, [ 1.0, 3.0, 5.0, 4.0, 2.0 ], 'partial sort N=3' );
});

test( 'dlasrt.ndarray rejects old single-char id values', function t() {
	var d;

	d = new Float64Array( [ 3.0, 1.0, 2.0 ] );
	assert.throws( function throws() {
		dlasrt.ndarray( 'I', 3, d, 1, 0 );
	}, TypeError, 'rejects uppercase I' );

	assert.throws( function throws() {
		dlasrt.ndarray( 'D', 3, d, 1, 0 );
	}, TypeError, 'rejects uppercase D' );

	assert.throws( function throws() {
		dlasrt.ndarray( 'i', 3, d, 1, 0 );
	}, TypeError, 'rejects lowercase i' );

	assert.throws( function throws() {
		dlasrt.ndarray( 'd', 3, d, 1, 0 );
	}, TypeError, 'rejects lowercase d' );
});

test( 'dlasrt.ndarray handles large array with many duplicates', function t() {
	var sorted;
	var d;
	var i;

	d = new Float64Array( 50 );
	for ( i = 0; i < 50; i++ ) {
		d[ i ] = ( i % 3 ) * 1.0; // values cycle: 0, 1, 2, 0, 1, 2, ...
	}

	dlasrt.ndarray( 'increasing', 50, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 50; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'many duplicates sorted increasing' );
});

test( 'dlasrt.ndarray handles large array with many duplicates (decreasing)', function t() { // eslint-disable-line max-len
	var sorted;
	var d;
	var i;

	d = new Float64Array( 50 );
	for ( i = 0; i < 50; i++ ) {
		d[ i ] = ( i % 3 ) * 1.0;
	}

	dlasrt.ndarray( 'decreasing', 50, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 50; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, 'many duplicates sorted decreasing' );
});

test( 'dlasrt.ndarray handles exactly SELECT+1 (21) elements', function t() {
	var sorted;
	var d;
	var i;

	// 21 elements: triggers quicksort path (endd - start = 20 > SELECT=20 is false, so 21 elements = endd-start=20 which is exactly SELECT, meaning it still uses insertion sort) // eslint-disable-line max-len

	// Use 22 elements to trigger quicksort
	d = new Float64Array( 22 );
	for ( i = 0; i < 22; i++ ) {
		d[ i ] = 22.0 - i;
	}

	dlasrt.ndarray( 'increasing', 22, d, 1, 0 );

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

test( 'dlasrt.ndarray handles exactly 21 elements (boundary for quicksort)', function t() { // eslint-disable-line max-len
	var sorted;
	var d;
	var i;

	// 21 elements: endd-start = 20 = SELECT, uses insertion sort
	d = new Float64Array( 21 );
	for ( i = 0; i < 21; i++ ) {
		d[ i ] = 21.0 - i;
	}

	dlasrt.ndarray( 'increasing', 21, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 21; i++ ) {
		if ( d[ i ] < d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, '21 elements sorted increasing' );
});

test( 'dlasrt.ndarray handles exactly 21 elements decreasing', function t() {
	var sorted;
	var d;
	var i;

	d = new Float64Array( 21 );
	for ( i = 0; i < 21; i++ ) {
		d[ i ] = i + 1.0;
	}

	dlasrt.ndarray( 'decreasing', 21, d, 1, 0 );

	sorted = true;
	for ( i = 1; i < 21; i++ ) {
		if ( d[ i ] > d[ i - 1 ] ) {
			sorted = false;
			break;
		}
	}
	assert.ok( sorted, '21 elements sorted decreasing' );
});
