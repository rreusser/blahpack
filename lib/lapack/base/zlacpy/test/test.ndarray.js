// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacpy from './../lib/ndarray.js';

// FIXTURES //

import full_copy_3x3 from './fixtures/full_copy_3x3.json' with { type: 'json' };
import upper_copy_3x3 from './fixtures/upper_copy_3x3.json' with { type: 'json' };
import lower_copy_3x3 from './fixtures/lower_copy_3x3.json' with { type: 'json' };
import full_copy_2x4 from './fixtures/full_copy_2x4.json' with { type: 'json' };
import upper_copy_4x2 from './fixtures/upper_copy_4x2.json' with { type: 'json' };
import lower_copy_4x2 from './fixtures/lower_copy_4x2.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

function c128( arr ) {
	if ( arr instanceof Float64Array ) {
		return new Complex128Array( arr );
	}
	return new Complex128Array( arr );
}

/**
* Builds a clean Complex128Array input from the fixture.
*/
function buildInput( fixtureArr, M, N, LDA ) {
	var out = new Float64Array( 2 * LDA * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out[ j * 2 * LDA + i * 2 ] = fixtureArr[ j * 2 * LDA + i * 2 ];
			out[ j * 2 * LDA + i * 2 + 1 ] = fixtureArr[ j * 2 * LDA + i * 2 + 1 ];
		}
	}
	return c128( out );
}

// TESTS //

test( 'zlacpy: full copy 3x3', function t() {
	var tc = full_copy_3x3;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'all', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: upper copy 3x3', function t() {
	var tc = upper_copy_3x3;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'upper', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: lower copy 3x3', function t() {
	var tc = lower_copy_3x3;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'lower', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: M=0 returns B unchanged', function t() {
	var B = new Complex128Array( 15 );
	zlacpy( 'all', 0, 3, new Complex128Array( 15 ), 1, 5, 0, B, 1, 5, 0 );

	var expected = new Float64Array( 30 );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), Array.from( expected ), 1e-14, 'B' );
});

test( 'zlacpy: N=0 returns B unchanged', function t() {
	var B = new Complex128Array( 15 );
	zlacpy( 'all', 3, 0, new Complex128Array( 15 ), 1, 5, 0, B, 1, 5, 0 );

	var expected = new Float64Array( 30 );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), Array.from( expected ), 1e-14, 'B' );
});

test( 'zlacpy: full copy 2x4 (non-square)', function t() {
	var tc = full_copy_2x4;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'all', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: upper copy 4x2 (non-square, M > N)', function t() {
	var tc = upper_copy_4x2;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'upper', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: lower copy 4x2 (non-square, M > N)', function t() {
	var tc = lower_copy_4x2;
	var LDA = 5;
	var A = buildInput( tc.A, tc.M, tc.N, LDA );
	var B = new Complex128Array( LDA * tc.N );

	zlacpy( 'lower', tc.M, tc.N, A, 1, LDA, 0, B, 1, LDA, 0 );

	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'zlacpy: returns B', function t() {
	var A = c128( new Float64Array( [ 1, 2, 3, 4 ] ) );
	var B = new Complex128Array( 2 );
	var out = zlacpy( 'all', 1, 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( out, B );
});

test( 'zlacpy: supports lowercase uplo', function t() {
	// A 2x2 complex matrix, col-major with LDA=2
	// [ (1+2i)  (5+6i) ]
	// [ (3+4i)  (7+8i) ]
	var A = c128( new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] ) );
	var B;
	var Bv;

	// Test lowercase 'u'
	B = new Complex128Array( 4 );
	zlacpy( 'upper', 2, 2, A, 1, 2, 0, B, 1, 2, 0 );
	Bv = reinterpret( B, 0 );
	// Upper triangle: (0,0)=(1,2), (0,1)=(5,6), (1,1)=(7,8)
	assert.deepStrictEqual( Array.from( Bv ), [ 1, 2, 0, 0, 5, 6, 7, 8 ] );

	// Test lowercase 'l'
	B = new Complex128Array( 4 );
	zlacpy( 'lower', 2, 2, A, 1, 2, 0, B, 1, 2, 0 );
	Bv = reinterpret( B, 0 );
	// Lower triangle: (0,0)=(1,2), (1,0)=(3,4), (1,1)=(7,8)
	assert.deepStrictEqual( Array.from( Bv ), [ 1, 2, 3, 4, 0, 0, 7, 8 ] );
});

test( 'zlacpy: supports offset', function t() {
	// Place a 1x1 complex matrix at offset 2 (complex) in a larger array
	var A = c128( new Float64Array( [ 0, 0, 0, 0, 99, 42 ] ) );
	var B = new Complex128Array( 3 );

	zlacpy( 'all', 1, 1, A, 1, 1, 2, B, 1, 1, 2 );

	var Bv = reinterpret( B, 0 );
	assert.deepStrictEqual( Array.from( Bv ), [ 0, 0, 0, 0, 99, 42 ] );
});

test( 'zlacpy: M=0 with upper uplo returns B unchanged', function t() {
	var B = new Complex128Array( 4 );
	zlacpy( 'upper', 0, 2, new Complex128Array( 4 ), 1, 2, 0, B, 1, 2, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( B, 0 ) ), [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
});

test( 'zlacpy: M=0 with lower uplo returns B unchanged', function t() {
	var B = new Complex128Array( 4 );
	zlacpy( 'lower', 0, 2, new Complex128Array( 4 ), 1, 2, 0, B, 1, 2, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( B, 0 ) ), [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
});

test( 'zlacpy: N=0 with upper uplo returns B unchanged', function t() {
	var B = new Complex128Array( 4 );
	zlacpy( 'upper', 2, 0, new Complex128Array( 4 ), 1, 2, 0, B, 1, 2, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( B, 0 ) ), [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
});

test( 'zlacpy: N=0 with lower uplo returns B unchanged', function t() {
	var B = new Complex128Array( 4 );
	zlacpy( 'lower', 2, 0, new Complex128Array( 4 ), 1, 2, 0, B, 1, 2, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( B, 0 ) ), [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
});
