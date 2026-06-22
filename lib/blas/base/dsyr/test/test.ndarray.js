/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr from './../lib/index.js';
import ndarray from './../lib/ndarray.js';

test( 'dsyr: main export is a function', function t() {
	assert.strictEqual( typeof dsyr, 'function' );
});

test( 'dsyr: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof dsyr.ndarray, 'function' );
});

test( 'dsyr: upper triangle, basic 3x3 (alpha=1, x=[1,2,3])', function t() {
	var expected;
	var out;
	var A;
	var x;

	A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	x = new Float64Array([ 1, 2, 3 ]);
	expected = new Float64Array([ 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	out = dsyr.ndarray( 'upper', 3, 1.0, x, 1, 0, A, 1, 3, 0 );
	assert.strictEqual( out, A, 'returns A' );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: lower triangle, basic 3x3 (alpha=1, x=[1,2,3])', function t() {
	// Lower: A[0,0]+=1, A[1,0]+=2, A[2,0]+=3, A[1,1]+=4, A[2,1]+=6, A[2,2]+=9
	var expected = new Float64Array([ 2, 2, 3, 0, 5, 6, 0, 0, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 2, 3 ]);

	dsyr.ndarray( 'lower', 3, 1.0, x, 1, 0, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: N=0 quick return', function t() {
	var A = new Float64Array([ 99 ]);
	dsyr.ndarray( 'upper', 0, 1.0, new Float64Array([ 5 ]), 1, 0, A, 1, 1, 0 );
	assert.strictEqual( A[ 0 ], 99, 'A unchanged' );
});

test( 'dsyr: alpha=0 quick return', function t() {
	var expected = new Float64Array([ 1, 0, 0, 1 ]);
	var A = new Float64Array([ 1, 0, 0, 1 ]);
	dsyr.ndarray( 'upper', 2, 0.0, new Float64Array([ 5, 6 ]), 1, 0, A, 1, 2, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: N=1 edge case', function t() {
	// A(0,0) += alpha * x[0] * x[0] = 2 * 3 * 3 = 18
	var A = new Float64Array([ 5 ]);
	dsyr.ndarray( 'upper', 1, 2.0, new Float64Array([ 3 ]), 1, 0, A, 1, 1, 0 );
	assert.strictEqual( A[ 0 ], 23 );
});

test( 'dsyr: upper triangle with alpha=2', function t() {
	var expected = new Float64Array([ 3, 0, 0, 4, 9, 0, 6, 12, 19 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 2, 3 ]);

	dsyr.ndarray( 'upper', 3, 2.0, x, 1, 0, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: x with zeros skips column (upper)', function t() {
	// x=[1,0,3], so j=1 is skipped by the x[jx]!==0 guard
	var expected = new Float64Array([ 2, 0, 0, 0, 1, 0, 3, 0, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 0, 3 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, 1, 0, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: x with zeros skips column (lower)', function t() {
	var expected = new Float64Array([ 2, 0, 3, 0, 1, 0, 0, 0, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 0, 3 ]);

	dsyr.ndarray( 'lower', 3, 1.0, x, 1, 0, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: non-unit stride (strideX=2)', function t() {
	// x data: [1, _, 2, _, 3], strideX=2, offsetX=0 → x=[1,2,3]
	var expected = new Float64Array([ 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 99, 2, 99, 3 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, 2, 0, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: negative stride (strideX=-1)', function t() {
	// x=[3,2,1] with strideX=-1, offsetX=2 → reads x[2],x[1],x[0] = 1,2,3
	var expected = new Float64Array([ 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 3, 2, 1 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, -1, 2, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: offsetX non-zero', function t() {
	// x data: [_, 1, 2, 3], offsetX=1 → x=[1,2,3]
	var expected = new Float64Array([ 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 99, 1, 2, 3 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, 1, 1, A, 1, 3, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: offsetA non-zero', function t() {
	// A data: [_, 1, 0, 0, 0, 1, 0, 0, 0, 1], offsetA=1
	var expected = new Float64Array([ 99, 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	var A = new Float64Array([ 99, 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 2, 3 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, 1, 0, A, 1, 3, 1 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: row-major layout (strideA1=3, strideA2=1)', function t() {
	// Row-major 3x3 identity: [1,0,0, 0,1,0, 0,0,1]
	// Upper triangle with row-major: elements (i,j) where i<=j
	// x=[1,2,3], alpha=1
	// (0,0)+=1, (0,1)+=2, (0,2)+=3, (1,1)+=4, (1,2)+=6, (2,2)+=9
	// Row-major indices: (0,0)=0, (0,1)=1, (0,2)=2, (1,1)=4, (1,2)=5, (2,2)=8
	var expected = new Float64Array([ 2, 2, 3, 0, 5, 6, 0, 0, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 2, 3 ]);

	dsyr.ndarray( 'upper', 3, 1.0, x, 1, 0, A, 3, 1, 0 );
	assert.deepStrictEqual( A, expected );
});

test( 'dsyr: lower triangle, row-major', function t() {
	var expected = new Float64Array([ 2, 0, 0, 2, 5, 0, 3, 6, 10 ]);
	var A = new Float64Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
	var x = new Float64Array([ 1, 2, 3 ]);

	dsyr.ndarray( 'lower', 3, 1.0, x, 1, 0, A, 3, 1, 0 );
	assert.deepStrictEqual( A, expected );
});

// ndarray validation tests

test( 'dsyr: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 3, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsyr: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, 1.0, new Float64Array( 3 ), 1, 0, new Float64Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsyr: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 3, 1.0, new Float64Array( 3 ), 0, 0, new Float64Array( 9 ), 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
