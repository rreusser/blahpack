// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacp2 from './../lib/ndarray.js';

// FIXTURES //

import full_3x3 from './fixtures/full_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import full_2x4 from './fixtures/full_2x4.json' with { type: 'json' };
import upper_4x2 from './fixtures/upper_4x2.json' with { type: 'json' };
import lower_2x4 from './fixtures/lower_2x4.json' with { type: 'json' };
import full_1x1 from './fixtures/full_1x1.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Builds a Float64Array for a real M-by-N matrix stored column-major with leading dimension LDA.
*/
function buildRealInput( fixtureArr, M, N, LDA ) {
	var out = new Float64Array( LDA * N );
	var i;
	var j;
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out[ j * LDA + i ] = fixtureArr[ j * M + i ];
		}
	}
	return out;
}

/**
* Extracts the M-by-N submatrix from a Complex128Array with leading dimension LDB, packed column-major.
*/
function extractComplex( B, M, N, LDB ) {
	var Bv = reinterpret( B, 0 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			out.push( Bv[ j * LDB * 2 + i * 2 ] );
			out.push( Bv[ j * LDB * 2 + i * 2 + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zlacp2 is a function', function t() {
	assert.equal( typeof zlacp2, 'function' );
});

test( 'zlacp2: full copy 3x3', function t() {
	var result;
	var tc = full_3x3;
	var LDA = 3;
	var LDB = 3;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'all', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: upper copy 3x3', function t() {
	var result;
	var tc = upper_3x3;
	var LDA = 3;
	var LDB = 3;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'upper', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: lower copy 3x3', function t() {
	var result;
	var tc = lower_3x3;
	var LDA = 3;
	var LDB = 3;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'lower', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: full copy 2x4 (rectangular, M < N)', function t() {
	var result;
	var tc = full_2x4;
	var LDA = 2;
	var LDB = 2;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'all', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: upper copy 4x2 (rectangular, M > N)', function t() {
	var result;
	var tc = upper_4x2;
	var LDA = 4;
	var LDB = 4;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'upper', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: lower copy 2x4 (rectangular, M < N)', function t() {
	var result;
	var tc = lower_2x4;
	var LDA = 2;
	var LDB = 2;
	var A = buildRealInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDB * tc.N );

	zlacp2( 'lower', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDB, 0 );

	result = extractComplex( B, tc.M, tc.N, LDB );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zlacp2: edge case M=0 (no-op)', function t() {
	var B = new Complex128Array( [ 99.0, 99.0, 99.0, 99.0 ] );
	var A = new Float64Array( [ 1.0, 2.0 ] );
	var Bv;

	zlacp2( 'all', 0, 2, A, 1, 1, 0, B, 1, 1, 0 );

	// B should be unchanged
	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 99.0, 'B[0] unchanged' );
	assert.equal( Bv[ 1 ], 99.0, 'B[1] unchanged' );
	assert.equal( Bv[ 2 ], 99.0, 'B[2] unchanged' );
	assert.equal( Bv[ 3 ], 99.0, 'B[3] unchanged' );
});

test( 'zlacp2: edge case N=0 (no-op)', function t() {
	var B = new Complex128Array( [ 99.0, 99.0, 99.0, 99.0 ] );
	var A = new Float64Array( [ 1.0, 2.0 ] );
	var Bv;

	zlacp2( 'all', 2, 0, A, 1, 2, 0, B, 1, 2, 0 );

	// B should be unchanged
	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 99.0, 'B[0] unchanged' );
	assert.equal( Bv[ 1 ], 99.0, 'B[1] unchanged' );
});

test( 'zlacp2: full copy 1x1', function t() {
	var tc = full_1x1;
	var B = new Complex128Array( 1 );
	var A = new Float64Array( [ tc.A11 ] );
	var Bv;

	zlacp2( 'all', 1, 1, A, 1, 1, 0, B, 1, 1, 0 );

	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.B, 1e-14, 'B' );
});

test( 'zlacp2: imaginary parts are zero', function t() {
	var A = new Float64Array( [ 3.14, 2.72, 1.41, 1.73 ] );
	var B = new Complex128Array( 4 );
	var Bv;

	zlacp2( 'all', 2, 2, A, 1, 2, 0, B, 1, 2, 0 );

	Bv = reinterpret( B, 0 );

	// Check that all imaginary parts are exactly 0
	assert.equal( Bv[ 1 ], 0.0, 'B[0,0] imag = 0' );
	assert.equal( Bv[ 3 ], 0.0, 'B[1,0] imag = 0' );
	assert.equal( Bv[ 5 ], 0.0, 'B[0,1] imag = 0' );
	assert.equal( Bv[ 7 ], 0.0, 'B[1,1] imag = 0' );

	// Check real parts
	assert.equal( Bv[ 0 ], 3.14, 'B[0,0] real' );
	assert.equal( Bv[ 2 ], 2.72, 'B[1,0] real' );
	assert.equal( Bv[ 4 ], 1.41, 'B[0,1] real' );
	assert.equal( Bv[ 6 ], 1.73, 'B[1,1] real' );
});

test( 'zlacp2: returns B', function t() {
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var B = new Complex128Array( 4 );
	var result;

	result = zlacp2( 'all', 2, 2, A, 1, 2, 0, B, 1, 2, 0 );
	assert.equal( result, B, 'returns B' );
});

test( 'zlacp2: with non-trivial leading dimensions (LDA > M)', function t() {
	// 2x2 matrix stored with LDA=4
	var A = new Float64Array( [
		10.0, 20.0, 0.0, 0.0,  // column 1: rows 1-2 plus padding
		30.0, 40.0, 0.0, 0.0   // column 2: rows 1-2 plus padding
	] );
	var LDA = 4;
	var LDB = 3;
	var B = new Complex128Array( LDB * 2 );
	var Bv;

	zlacp2( 'all', 2, 2, A, 1, LDA, 0, B, 1, LDB, 0 );

	Bv = reinterpret( B, 0 );

	// B[0,0] = 10+0i, B[1,0] = 20+0i, B[0,1] = 30+0i, B[1,1] = 40+0i
	assert.equal( Bv[ 0 ], 10.0 );
	assert.equal( Bv[ 1 ], 0.0 );
	assert.equal( Bv[ 2 ], 20.0 );
	assert.equal( Bv[ 3 ], 0.0 );
	assert.equal( Bv[ LDB * 2 ], 30.0 );
	assert.equal( Bv[ LDB * 2 + 1 ], 0.0 );
	assert.equal( Bv[ LDB * 2 + 2 ], 40.0 );
	assert.equal( Bv[ LDB * 2 + 3 ], 0.0 );
});

test( 'zlacp2: upper with offset', function t() {
	// Test offsetA and offsetB support
	var A = new Float64Array( [
		99.0,       // padding at index 0
		1.0, 2.0,   // column 1 of 2x2 matrix
		3.0, 4.0    // column 2 of 2x2 matrix
	] );
	var B = new Complex128Array( 5 ); // 5 complex elements, offset by 1
	var Bv;

	// A is at offset 1, stride1=1, stride2=2
	// B is at offset 1, stride1=1, stride2=2
	zlacp2( 'upper', 2, 2, A, 1, 2, 1, B, 1, 2, 1 );

	Bv = reinterpret( B, 0 );

	// Upper triangle: (0,0), (0,1), (1,1)
	// B[1] = (1.0, 0.0) -- element (0,0)
	assert.equal( Bv[ 2 ], 1.0, 'B[0,0] real' );
	assert.equal( Bv[ 3 ], 0.0, 'B[0,0] imag' );

	// B[1+1*sb1] = element (1,0) should NOT be copied (lower)
	assert.equal( Bv[ 4 ], 0.0, 'B[1,0] real (not copied)' );
	assert.equal( Bv[ 5 ], 0.0, 'B[1,0] imag (not copied)' );

	// B at column 1: offset 1 + 1*2 = 3 complex elements = index 6 in Float64
	// B[0,1] at complex element 3 = Float64 index 6
	assert.equal( Bv[ 6 ], 3.0, 'B[0,1] real' );
	assert.equal( Bv[ 7 ], 0.0, 'B[0,1] imag' );

	// B[1,1] at complex element 4 = Float64 index 8
	assert.equal( Bv[ 8 ], 4.0, 'B[1,1] real' );
	assert.equal( Bv[ 9 ], 0.0, 'B[1,1] imag' );
});

test( 'zlacp2: lower with M=0 (no-op)', function t() {
	var A = new Float64Array( [ 1.0 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlacp2( 'upper', 0, 1, A, 1, 1, 0, B, 1, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 0.0, 'B unchanged' );
	assert.equal( Bv[ 1 ], 0.0, 'B unchanged' );
});

test( 'zlacp2: lower 1x1', function t() {
	var A = new Float64Array( [ 7.5 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlacp2( 'lower', 1, 1, A, 1, 1, 0, B, 1, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 7.5, 'B[0,0] real' );
	assert.equal( Bv[ 1 ], 0.0, 'B[0,0] imag' );
});

test( 'zlacp2: upper 1x1', function t() {
	var A = new Float64Array( [ 7.5 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlacp2( 'upper', 1, 1, A, 1, 1, 0, B, 1, 1, 0 );

	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 7.5, 'B[0,0] real' );
	assert.equal( Bv[ 1 ], 0.0, 'B[0,0] imag' );
});
