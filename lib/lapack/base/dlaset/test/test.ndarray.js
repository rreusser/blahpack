/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaset from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import full_4x4 from './fixtures/full_4x4.json' with { type: 'json' };
import full_5x3 from './fixtures/full_5x3.json' with { type: 'json' };
import full_3x5 from './fixtures/full_3x5.json' with { type: 'json' };
import upper_5x3 from './fixtures/upper_5x3.json' with { type: 'json' };
import lower_3x5 from './fixtures/lower_3x5.json' with { type: 'json' };
import full_4x1 from './fixtures/full_4x1.json' with { type: 'json' };
import upper_3x5 from './fixtures/upper_3x5.json' with { type: 'json' };
import lower_5x3 from './fixtures/lower_5x3.json' with { type: 'json' };

// FUNCTIONS //

/**
* Create a Float64Array of length n filled with value v.
*/
function filled( n, v ) {
	var arr = new Float64Array( n );
	var i;
	for ( i = 0; i < n; i++ ) {
		arr[ i ] = v;
	}
	return arr;
}

/**
* Extract the M-by-N column-major submatrix from A with stride/offset.
*/
function extractMatrix( A, M, N, sa1, sa2, offset ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ offset + i * sa1 + j * sa2 ] );
		}
	}
	return out;
}

// TESTS //

test( 'dlaset: upper_4x4', function t() {
	var result;
	var tc;
	var A;

	tc = upper_4x4;
	A = filled( 16, -1.0 );
	dlaset( 'upper', 4, 4, 2.0, 5.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 4, 1, 4, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: lower_4x4', function t() {
	var result;
	var tc;
	var A;

	tc = lower_4x4;
	A = filled( 16, -1.0 );
	dlaset( 'lower', 4, 4, 3.0, 7.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 4, 1, 4, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: full_4x4', function t() {
	var result;
	var tc;
	var A;

	tc = full_4x4;
	A = filled( 16, -1.0 );
	dlaset( 'all', 4, 4, 1.0, 9.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 4, 1, 4, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: full_5x3', function t() {
	var result;
	var tc;
	var A;

	tc = full_5x3;
	A = filled( 15, -1.0 );
	dlaset( 'all', 5, 3, 4.0, 8.0, A, 1, 5, 0 );
	result = extractMatrix( A, 5, 3, 1, 5, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: full_3x5', function t() {
	var result;
	var tc;
	var A;

	tc = full_3x5;
	A = filled( 15, -1.0 );
	dlaset( 'all', 3, 5, 6.0, 2.0, A, 1, 3, 0 );
	result = extractMatrix( A, 3, 5, 1, 3, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: upper_5x3', function t() {
	var result;
	var tc;
	var A;

	tc = upper_5x3;
	A = filled( 15, -1.0 );
	dlaset( 'upper', 5, 3, 2.0, 5.0, A, 1, 5, 0 );
	result = extractMatrix( A, 5, 3, 1, 5, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: lower_3x5', function t() {
	var result;
	var tc;
	var A;

	tc = lower_3x5;
	A = filled( 15, -1.0 );
	dlaset( 'lower', 3, 5, 3.0, 7.0, A, 1, 3, 0 );
	result = extractMatrix( A, 3, 5, 1, 3, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: m_zero (quick return)', function t() {
	var expected;
	var result;
	var A;
	var i;

	A = filled( 16, -1.0 );
	dlaset( 'all', 0, 4, 1.0, 1.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 4, 1, 4, 0 );
	expected = [];
	for ( i = 0; i < 16; i++ ) {
		expected.push( -1.0 );
	}
	assert.deepStrictEqual( result, expected );
});

test( 'dlaset: n_zero (quick return)', function t() {
	var expected;
	var result;
	var A;
	var i;

	A = filled( 16, -1.0 );
	dlaset( 'all', 4, 0, 1.0, 1.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 4, 1, 4, 0 );
	expected = [];
	for ( i = 0; i < 16; i++ ) {
		expected.push( -1.0 );
	}
	assert.deepStrictEqual( result, expected );
});

test( 'dlaset: full_4x1', function t() {
	var result;
	var tc;
	var A;

	tc = full_4x1;
	A = filled( 4, -1.0 );
	dlaset( 'all', 4, 1, 3.0, 7.0, A, 1, 4, 0 );
	result = extractMatrix( A, 4, 1, 1, 4, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: upper_3x5', function t() {
	var result;
	var tc;
	var A;

	tc = upper_3x5;
	A = filled( 15, -1.0 );
	dlaset( 'upper', 3, 5, 2.0, 5.0, A, 1, 3, 0 );
	result = extractMatrix( A, 3, 5, 1, 3, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: lower_5x3', function t() {
	var result;
	var tc;
	var A;

	tc = lower_5x3;
	A = filled( 15, -1.0 );
	dlaset( 'lower', 5, 3, 3.0, 7.0, A, 1, 5, 0 );
	result = extractMatrix( A, 5, 3, 1, 5, 0 );
	assert.deepStrictEqual( result, tc.A );
});

test( 'dlaset: returns A', function t() {
	var result;
	var A;

	A = filled( 9, 0.0 );
	result = dlaset( 'all', 3, 3, 1.0, 2.0, A, 1, 3, 0 );
	assert.strictEqual( result, A );
});

test( 'dlaset: works with non-zero offset', function t() {
	var A = filled( 20, -1.0 );

	// Place a 3x3 matrix starting at offset 5
	dlaset( 'all', 3, 3, 4.0, 8.0, A, 1, 3, 5 );

	// Elements before offset should be untouched
	assert.strictEqual( A[ 0 ], -1.0 );
	assert.strictEqual( A[ 4 ], -1.0 );

	// Diagonal should be beta=8
	assert.strictEqual( A[ 5 ], 8.0 );   // (0,0)
	assert.strictEqual( A[ 9 ], 8.0 );   // (1,1)
	assert.strictEqual( A[ 13 ], 8.0 );  // (2,2)

	// Off-diagonal should be alpha=4
	assert.strictEqual( A[ 6 ], 4.0 );   // (1,0)
	assert.strictEqual( A[ 7 ], 4.0 );   // (2,0)
	assert.strictEqual( A[ 8 ], 4.0 );   // (0,1)
	assert.strictEqual( A[ 10 ], 4.0 );  // (2,1)
	assert.strictEqual( A[ 11 ], 4.0 );  // (0,2)
	assert.strictEqual( A[ 12 ], 4.0 );  // (1,2)

	// Elements after should be untouched
	assert.strictEqual( A[ 14 ], -1.0 );
});

test( 'dlaset: works with non-unit strides (LDA padding)', function t() {
	// Simulate LDA=5 for a 3x3 matrix (column-major, strideA1=1, strideA2=5)
	var A = filled( 15, -1.0 );
	dlaset( 'all', 3, 3, 2.0, 6.0, A, 1, 5, 0 );

	// Column 0: [6, 2, 2, -1, -1]
	assert.strictEqual( A[ 0 ], 6.0 );
	assert.strictEqual( A[ 1 ], 2.0 );
	assert.strictEqual( A[ 2 ], 2.0 );
	assert.strictEqual( A[ 3 ], -1.0 );  // padding row
	assert.strictEqual( A[ 4 ], -1.0 );  // padding row

	// Column 1: [2, 6, 2, -1, -1]
	assert.strictEqual( A[ 5 ], 2.0 );
	assert.strictEqual( A[ 6 ], 6.0 );
	assert.strictEqual( A[ 7 ], 2.0 );

	// Column 2: [2, 2, 6, -1, -1]
	assert.strictEqual( A[ 10 ], 2.0 );
	assert.strictEqual( A[ 11 ], 2.0 );
	assert.strictEqual( A[ 12 ], 6.0 );
});
