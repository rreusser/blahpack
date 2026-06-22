/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpsv from './../lib/ndarray.js';


// FIXTURES //

import upper3x3_1rhs from './fixtures/upper_3x3_1rhs.json' with { type: 'json' };
import lower3x3_2rhs from './fixtures/lower_3x3_2rhs.json' with { type: 'json' };
import n1Fixture from './fixtures/n1.json' with { type: 'json' };
import singularFixture from './fixtures/singular.json' with { type: 'json' };
import upper4x4Pivot from './fixtures/upper_4x4_pivot.json' with { type: 'json' };
import lower4x4Pivot from './fixtures/lower_4x4_pivot.json' with { type: 'json' };

var fixtures = {
	'upper_3x3_1rhs': upper3x3_1rhs,
	'lower_3x3_2rhs': lower3x3_2rhs,
	'n1': n1Fixture,
	'singular': singularFixture,
	'upper_4x4_pivot': upper4x4Pivot,
	'lower_4x4_pivot': lower4x4Pivot
};


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
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
* @param {Array} actual - actual array
* @param {Array} expected - expected array
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
* Converts a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Build a Complex128Array from a flat array of interleaved doubles.
*
* @private
* @param {Array} flatDoubles - interleaved real/imag values
* @param {integer} nc - number of complex elements
* @returns {Complex128Array} complex array
*/
function buildComplex( flatDoubles, nc ) {
	var out = new Complex128Array( nc );
	var ov = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < 2 * nc; i++ ) {
		ov[ i ] = flatDoubles[ i ];
	}
	return out;
}

/**
* Compute b = A*X where A is N-by-N Hermitian packed, X is N-by-nrhs.
*
* Unpacks A to full dense and multiplies. All arrays are Float64 interleaved.
*
* @private
* @param {Array} APdata - packed Hermitian matrix as flat doubles
* @param {Float64Array} Xv - solution X (2*N*nrhs doubles, col-major stride N)
* @param {integer} N - matrix order
* @param {integer} nrhs - number of right-hand sides
* @param {string} uplo - `upper` or `lower`
* @returns {Float64Array} result b (2*N*nrhs doubles)
*/
function hermPackedMatMul( APdata, Xv, N, nrhs, uplo ) {
	var Afull;
	var are;
	var aim;
	var xre;
	var xim;
	var kk;
	var rh;
	var b;
	var i;
	var j;

	// Unpack to full dense
	Afull = new Float64Array( 2 * N * N );
	kk = 0;
	if ( uplo === 'upper' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				are = APdata[ 2 * kk ];
				aim = APdata[ ( 2 * kk ) + 1 ];
				Afull[ 2 * ( i + ( j * N ) ) ] = are;
				Afull[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = aim;
				Afull[ 2 * ( j + ( i * N ) ) ] = are;
				Afull[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -aim;
				kk += 1;
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				are = APdata[ 2 * kk ];
				aim = APdata[ ( 2 * kk ) + 1 ];
				Afull[ 2 * ( i + ( j * N ) ) ] = are;
				Afull[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = aim;
				Afull[ 2 * ( j + ( i * N ) ) ] = are;
				Afull[ ( 2 * ( j + ( i * N ) ) ) + 1 ] = -aim;
				kk += 1;
			}
		}
	}

	// Multiply b = A * X
	b = new Float64Array( 2 * N * nrhs );
	for ( rh = 0; rh < nrhs; rh++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( j = 0; j < N; j++ ) {
				are = Afull[ 2 * ( i + ( j * N ) ) ];
				aim = Afull[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				xre = Xv[ 2 * ( j + ( rh * N ) ) ];
				xim = Xv[ ( 2 * ( j + ( rh * N ) ) ) + 1 ];
				b[ 2 * ( i + ( rh * N ) ) ] += ( are * xre ) - ( aim * xim );
				b[ ( 2 * ( i + ( rh * N ) ) ) + 1 ] += ( are * xim ) + ( aim * xre ); // eslint-disable-line max-len
			}
		}
	}
	return b;
}

/**
* Run a fixture-based zhpsv test verifying A*x = b round-trip.
*
* @private
* @param {string} name - fixture test case name
* @param {string} uplo - `upper` or `lower`
*/
function runFixtureTest( name, uplo ) {
	var nrhs;
	var info;
	var IPIV;
	var Ax;
	var Bv;
	var bV;
	var nn;
	var tc;
	var AP;
	var N;
	var B;

	tc = fixtures[ name ];
	N = tc.n;
	nrhs = tc.nrhs;
	nn = ( N * ( N + 1 ) ) / 2;

	// Build input AP from fixture (packed Hermitian, nn complex elements)
	AP = buildComplex( tc.AP, nn );

	// Build input B (N*nrhs complex elements)
	B = buildComplex( tc.b, N * nrhs );
	bV = new Float64Array( tc.b );

	// Allocate IPIV
	IPIV = new Int32Array( N );

	// Call zhpsv: column-major B with strideB1=1, strideB2=N
	info = zhpsv( uplo, N, nrhs, AP, 1, 0, IPIV, 1, 0, B, 1, N, 0 );

	// Check info
	assert.strictEqual( info, tc.info, name + ': info' );

	// Verify round-trip: A * x should equal original b
	Bv = reinterpret( B, 0 );
	Ax = hermPackedMatMul( tc.AP, Bv, N, nrhs, uplo );
	assertArrayClose( toArray( Ax ), toArray( bV ), 1e-10, name + ' A*x=b' );
}


// TESTS //

test( 'zhpsv: main export is a function', function t() {
	assert.strictEqual( typeof zhpsv, 'function' );
});

test( 'zhpsv: upper 3x3, 1 RHS', function t() {
	runFixtureTest( 'upper_3x3_1rhs', 'upper' );
});

test( 'zhpsv: lower 3x3, 2 RHS', function t() {
	runFixtureTest( 'lower_3x3_2rhs', 'lower' );
});

test( 'zhpsv: N=1', function t() {
	runFixtureTest( 'n1', 'upper' );
});

test( 'zhpsv: N=0 quick return', function t() {
	var IPIV;
	var info;
	var AP;
	var B;

	AP = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zhpsv( 'upper', 0, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zhpsv: NRHS=0 quick return', function t() {
	var IPIV;
	var info;
	var AP;
	var B;

	AP = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zhpsv( 'upper', 1, 0, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zhpsv: singular matrix returns info > 0', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var nn;
	var N;
	var B;

	tc = fixtures[ 'singular' ];
	N = tc.n;
	nn = ( N * ( N + 1 ) ) / 2;
	AP = buildComplex( tc.AP, nn );
	B = buildComplex( tc.b, N * tc.nrhs );
	IPIV = new Int32Array( N );
	info = zhpsv( 'upper', N, tc.nrhs, AP, 1, 0, IPIV, 1, 0, B, 1, N, 0 );
	assert.strictEqual( info, tc.info );
	assert.ok( info > 0, 'singular matrix should return info > 0' );
});

test( 'zhpsv: upper 4x4 with 2x2 pivots', function t() {
	var IPIV;
	var info;
	var tc;
	var AP;
	var nn;
	var N;
	var B;

	tc = fixtures[ 'upper_4x4_pivot' ];
	N = tc.n;
	nn = ( N * ( N + 1 ) ) / 2;
	AP = buildComplex( tc.AP, nn );
	B = buildComplex( tc.b, N * tc.nrhs );
	IPIV = new Int32Array( N );
	info = zhpsv( 'upper', N, tc.nrhs, AP, 1, 0, IPIV, 1, 0, B, 1, N, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zhpsv: lower 4x4 with 2x2 pivots, 2 RHS', function t() {
	runFixtureTest( 'lower_4x4_pivot', 'lower' );
});
