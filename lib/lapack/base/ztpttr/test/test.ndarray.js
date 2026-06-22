

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpttr from './../lib/ndarray.js';

// FIXTURES //

import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };

// TESTS //

test( 'ztpttr is a function', function t() {
	assert.equal( typeof ztpttr, 'function' );
});

test( 'ztpttr: lower_4x4', function t() {
	var expected;
	var actual;
	var info;
	var tc;
	var AP;
	var Av;
	var A;
	var N;

	tc = lower_4x4;
	N = 4;
	AP = new Complex128Array( tc.AP );
	A = new Complex128Array( N * N );

	info = ztpttr( 'lower', N, AP, 1, 0, A, 1, N, 0 );

	expected = new Float64Array( tc.A );
	Av = reinterpret( A, 0 );
	actual = Av;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'ztpttr: upper_4x4', function t() {
	var expected;
	var actual;
	var info;
	var tc;
	var AP;
	var Av;
	var A;
	var N;

	tc = upper_4x4;
	N = 4;
	AP = new Complex128Array( tc.AP );
	A = new Complex128Array( N * N );

	info = ztpttr( 'upper', N, AP, 1, 0, A, 1, N, 0 );

	expected = new Float64Array( tc.A );
	Av = reinterpret( A, 0 );
	actual = Av;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'ztpttr: n_zero', function t() {
	var info;
	var AP;
	var A;

	AP = new Complex128Array( 0 );
	A = new Complex128Array( 0 );

	info = ztpttr( 'lower', 0, AP, 1, 0, A, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'ztpttr: n_one_lower', function t() {
	var info;
	var tc;
	var AP;
	var Av;
	var A;

	tc = n_one_lower;
	AP = new Complex128Array( [ 42.0, -3.5 ] );
	A = new Complex128Array( 1 );

	info = ztpttr( 'lower', 1, AP, 1, 0, A, 1, 1, 0 );

	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assert.equal( Av[ 0 ], tc.A[ 0 ] );
	assert.equal( Av[ 1 ], tc.A[ 1 ] );
});

test( 'ztpttr: n_one_upper', function t() {
	var info;
	var tc;
	var AP;
	var Av;
	var A;

	tc = n_one_upper;
	AP = new Complex128Array( [ 77.0, 1.25 ] );
	A = new Complex128Array( 1 );

	info = ztpttr( 'upper', 1, AP, 1, 0, A, 1, 1, 0 );

	Av = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assert.equal( Av[ 0 ], tc.A[ 0 ] );
	assert.equal( Av[ 1 ], tc.A[ 1 ] );
});

test( 'ztpttr: lower_3x3', function t() {
	var expected;
	var actual;
	var info;
	var tc;
	var AP;
	var Av;
	var A;
	var N;

	tc = lower_3x3;
	N = 3;
	AP = new Complex128Array( tc.AP );
	A = new Complex128Array( N * N );

	info = ztpttr( 'lower', N, AP, 1, 0, A, 1, N, 0 );

	expected = new Float64Array( tc.A );
	Av = reinterpret( A, 0 );
	actual = Av;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'ztpttr: upper_3x3', function t() {
	var expected;
	var actual;
	var info;
	var tc;
	var AP;
	var Av;
	var A;
	var N;

	tc = upper_3x3;
	N = 3;
	AP = new Complex128Array( tc.AP );
	A = new Complex128Array( N * N );

	info = ztpttr( 'upper', N, AP, 1, 0, A, 1, N, 0 );

	expected = new Float64Array( tc.A );
	Av = reinterpret( A, 0 );
	actual = Av;
	assert.equal( info, tc.info );
	assert.deepEqual( actual, expected );
});

test( 'ztpttr: supports AP stride', function t() {
	var info;
	var AP;
	var Av;
	var A;

	// Lower 2x2: packed has 3 complex elements. AP with stride 2: elements at indices 0, 2, 4
	AP = new Complex128Array( [ 1.0, 0.5, 99.0, 99.0, 2.0, 1.5, 99.0, 99.0, 3.0, 2.5 ] );
	A = new Complex128Array( 4 );

	info = ztpttr( 'lower', 2, AP, 2, 0, A, 1, 2, 0 );

	Av = reinterpret( A, 0 );
	assert.equal( info, 0 );
	// Column-major: A(0,0) = AP[0] = (1.0, 0.5)
	assert.equal( Av[ 0 ], 1.0 );
	assert.equal( Av[ 1 ], 0.5 );
	// A(1,0) = AP[2] = (2.0, 1.5)
	assert.equal( Av[ 2 ], 2.0 );
	assert.equal( Av[ 3 ], 1.5 );
	// A(0,1) = not set by lower (should remain zero)
	assert.equal( Av[ 4 ], 0.0 );
	assert.equal( Av[ 5 ], 0.0 );
	// A(1,1) = AP[4] = (3.0, 2.5)
	assert.equal( Av[ 6 ], 3.0 );
	assert.equal( Av[ 7 ], 2.5 );
});

test( 'ztpttr: supports AP offset', function t() {
	var info;
	var AP;
	var Av;
	var A;

	// Lower 2x2: packed has 3 complex elements at offset 2
	AP = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 5.0, 0.1, 6.0, 0.2, 7.0, 0.3 ] );
	A = new Complex128Array( 4 );

	info = ztpttr( 'lower', 2, AP, 1, 2, A, 1, 2, 0 );

	Av = reinterpret( A, 0 );
	assert.equal( info, 0 );
	assert.equal( Av[ 0 ], 5.0 );
	assert.equal( Av[ 1 ], 0.1 );
	assert.equal( Av[ 2 ], 6.0 );
	assert.equal( Av[ 3 ], 0.2 );
	assert.equal( Av[ 4 ], 0.0 );
	assert.equal( Av[ 5 ], 0.0 );
	assert.equal( Av[ 6 ], 7.0 );
	assert.equal( Av[ 7 ], 0.3 );
});

test( 'ztpttr: supports A offset', function t() {
	var info;
	var AP;
	var Av;
	var A;

	// Upper 2x2: packed = [(10, 0.1), (20, 0.2), (30, 0.3)], output at offset 4
	AP = new Complex128Array( [ 10.0, 0.1, 20.0, 0.2, 30.0, 0.3 ] );
	A = new Complex128Array( 8 );

	info = ztpttr( 'upper', 2, AP, 1, 0, A, 1, 2, 4 );

	Av = reinterpret( A, 0 );
	assert.equal( info, 0 );
	// A(0,0) at offset 4 complex = index 8 in Float64
	assert.equal( Av[ 8 ], 10.0 );
	assert.equal( Av[ 9 ], 0.1 );
	// A(1,0) - not set by upper
	assert.equal( Av[ 10 ], 0.0 );
	assert.equal( Av[ 11 ], 0.0 );
	// A(0,1) at offset + strideA2
	assert.equal( Av[ 12 ], 20.0 );
	assert.equal( Av[ 13 ], 0.2 );
	// A(1,1)
	assert.equal( Av[ 14 ], 30.0 );
	assert.equal( Av[ 15 ], 0.3 );
});

test( 'ztpttr: supports non-unit A strides', function t() {
	var info;
	var AP;
	var Av;
	var A;

	// Lower 2x2: packed = [(1, 0.1), (2, 0.2), (3, 0.3)]
	// strideA1=2, strideA2=4 (row stride 2 complex, col stride 4 complex)
	AP = new Complex128Array( [ 1.0, 0.1, 2.0, 0.2, 3.0, 0.3 ] );
	A = new Complex128Array( 8 );

	info = ztpttr( 'lower', 2, AP, 1, 0, A, 2, 4, 0 );

	Av = reinterpret( A, 0 );
	assert.equal( info, 0 );
	// A(0,0): offset + 0*strideA1 + 0*strideA2 = 0 -> Float64 index 0
	assert.equal( Av[ 0 ], 1.0 );
	assert.equal( Av[ 1 ], 0.1 );
	// A(1,0): offset + 1*strideA1 + 0*strideA2 = 2 complex -> Float64 index 4
	assert.equal( Av[ 4 ], 2.0 );
	assert.equal( Av[ 5 ], 0.2 );
	// A(0,1): not set by lower
	assert.equal( Av[ 8 ], 0.0 );
	assert.equal( Av[ 9 ], 0.0 );
	// A(1,1): offset + 1*strideA1 + 1*strideA2 = 6 complex -> Float64 index 12
	assert.equal( Av[ 12 ], 3.0 );
	assert.equal( Av[ 13 ], 0.3 );
});
