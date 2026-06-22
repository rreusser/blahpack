// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlasyf from './../lib/ndarray.js';

// FIXTURES //

var MAXN = 10; // must match Fortran test LDA

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_3x3_nb2 from './fixtures/upper_3x3_nb2.json' with { type: 'json' };
import upper_1x1 from './fixtures/upper_1x1.json' with { type: 'json' };
import upper_2x2_pivot from './fixtures/upper_2x2_pivot.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_8x8_nb4 from './fixtures/upper_8x8_nb4.json' with { type: 'json' };
import lower_8x8_nb4 from './fixtures/lower_8x8_nb4.json' with { type: 'json' };
import upper_6x6_nb2 from './fixtures/upper_6x6_nb2.json' with { type: 'json' };
import lower_6x6_nb2 from './fixtures/lower_6x6_nb2.json' with { type: 'json' };
import upper_5x5_2x2pivot from './fixtures/upper_5x5_2x2pivot.json' with { type: 'json' };
import lower_5x5_2x2pivot from './fixtures/lower_5x5_2x2pivot.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Extract NxN complex matrix from fixture with leading dimension MAXN.
* Fixture stores column-major with LDA=MAXN as flat Float64 pairs.
* Returns flat Float64 array with LDA=N.
*/
function extractA( fixtureA, N ) {
	var result = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			result.push( fixtureA[ (i + j * MAXN) * 2 ] );
			result.push( fixtureA[ (i + j * MAXN) * 2 + 1 ] );
		}
	}
	return result;
}

/**
* Compare two Float64 arrays element by element with tolerance.
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch: actual ' + actual.length + ' vs expected ' + expected.length );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert Fortran 1-based IPIV to expected JS 0-based IPIV.
*/
function fortranIPIVtoJS( ipiv ) {
	return ipiv.map( function convert( v ) {
		if ( v > 0 ) {
			return v - 1;
		}
		return v; // negative values: ~(k-1) = -k, same as Fortran
	});
}

/**
* Fill upper triangle of complex symmetric matrix.
* entries: [[row, col, re, im], ...]
*/
function fillUpper( Av, N, entries ) {
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		Av[ (entries[i][0] + entries[i][1] * N) * 2 ] = entries[i][2];
		Av[ (entries[i][0] + entries[i][1] * N) * 2 + 1 ] = entries[i][3];
	}
}

/**
* Fill lower triangle of complex symmetric matrix.
*/
function fillLower( Av, N, entries ) {
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		Av[ (entries[i][0] + entries[i][1] * N) * 2 ] = entries[i][2];
		Av[ (entries[i][0] + entries[i][1] * N) * 2 + 1 ] = entries[i][3];
	}
}

// TESTS //

test( 'zlasyf: main export is a function', function t() {
	assert.strictEqual( typeof zlasyf, 'function' );
});

test( 'zlasyf: 4x4 upper, nb=4', function t() {
	var tc = upper_4x4;
	var N = 4;
	var nb = 4;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,4,1], [0,1,1,2], [1,1,5,0], [0,2,2,0], [1,2,1,1], [2,2,6,2],
		[0,3,0,1], [1,3,0,0], [2,3,1,-1], [3,3,3,0]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 4x4 lower, nb=4', function t() {
	var tc = lower_4x4;
	var N = 4;
	var nb = 4;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[0,0,4,1], [1,0,1,2], [2,0,2,0], [3,0,0,1],
		[1,1,5,0], [2,1,1,1], [3,1,0,0],
		[2,2,6,2], [3,2,1,-1],
		[3,3,3,0]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 3x3 upper, nb=2 (partial panel)', function t() {
	var tc = upper_3x3_nb2;
	var N = 3;
	var nb = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,5,0], [0,1,2,1], [1,1,4,0], [0,2,1,0], [1,2,1,-1], [2,2,6,1]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 1x1 upper', function t() {
	var tc = upper_1x1;
	var expectedA;
	var result;

	var A = new Complex128Array( [ 7, 3 ] );
	var W = new Complex128Array( 1 );
	var IPIV = new Int32Array( 1 );
	result = zlasyf( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, W, 1, 1, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, 1 );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), expectedA, 1e-10, 'A' );
	assert.strictEqual( IPIV[ 0 ], fortranIPIVtoJS( tc.ipiv )[ 0 ], 'ipiv[0]' );
});

test( 'zlasyf: 2x2 upper with pivot', function t() {
	var tc = upper_2x2_pivot;
	var N = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,0.1,0], [0,1,3,4], [1,1,10,0]
	]);

	var W = new Complex128Array( N * 2 );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, 2, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 3x3 lower', function t() {
	var tc = lower_3x3;
	var N = 3;
	var nb = 3;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[0,0,5,0], [1,0,2,1], [2,0,1,0],
		[1,1,4,0], [2,1,1,-1],
		[2,2,6,1]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 8x8 upper, nb=4 (blocked loop)', function t() {
	var tc = upper_8x8_nb4;
	var N = 8;
	var nb = 4;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,10,1],
		[0,1,1,0.5], [1,1,9,0],
		[0,2,0.5,0.2], [1,2,0.8,-0.3], [2,2,11,0.5],
		[0,3,0.3,0.1], [1,3,0.4,0.2], [2,3,0.6,-0.1], [3,3,8,0],
		[0,4,0.2,0], [1,4,0.3,0.1], [2,4,0.5,0.2], [3,4,0.7,-0.3], [4,4,12,1],
		[0,5,0.1,0.1], [1,5,0.2,0], [2,5,0.4,0.1], [3,5,0.3,0.2], [4,5,0.6,-0.1], [5,5,7,0],
		[0,6,0.15,0.05], [1,6,0.25,0.15], [2,6,0.35,-0.05], [3,6,0.2,0.1], [4,6,0.4,0.2], [5,6,0.5,-0.15], [6,6,13,0.5],
		[0,7,0.1,0], [1,7,0.15,0.1], [2,7,0.2,0.05], [3,7,0.1,0], [4,7,0.3,0.1], [5,7,0.35,-0.2], [6,7,0.45,0.1], [7,7,6,0]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 8x8 lower, nb=4 (blocked loop)', function t() {
	var tc = lower_8x8_nb4;
	var N = 8;
	var nb = 4;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[0,0,10,1],
		[1,0,1,0.5], [1,1,9,0],
		[2,0,0.5,0.2], [2,1,0.8,-0.3], [2,2,11,0.5],
		[3,0,0.3,0.1], [3,1,0.4,0.2], [3,2,0.6,-0.1], [3,3,8,0],
		[4,0,0.2,0], [4,1,0.3,0.1], [4,2,0.5,0.2], [4,3,0.7,-0.3], [4,4,12,1],
		[5,0,0.1,0.1], [5,1,0.2,0], [5,2,0.4,0.1], [5,3,0.3,0.2], [5,4,0.6,-0.1], [5,5,7,0],
		[6,0,0.15,0.05], [6,1,0.25,0.15], [6,2,0.35,-0.05], [6,3,0.2,0.1], [6,4,0.4,0.2], [6,5,0.5,-0.15], [6,6,13,0.5],
		[7,0,0.1,0], [7,1,0.15,0.1], [7,2,0.2,0.05], [7,3,0.1,0], [7,4,0.3,0.1], [7,5,0.35,-0.2], [7,6,0.45,0.1], [7,7,6,0]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 6x6 upper, nb=2', function t() {
	var tc = upper_6x6_nb2;
	var N = 6;
	var nb = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,8,0],
		[0,1,1,1], [1,1,7,0.5],
		[0,2,0.5,0], [1,2,0.8,-0.2], [2,2,9,0],
		[0,3,0.3,0.1], [1,3,0.4,0.3], [2,3,0.6,-0.1], [3,3,10,1],
		[0,4,0.2,0], [1,4,0.3,0.1], [2,4,0.5,0.2], [3,4,0.7,-0.3], [4,4,6,0],
		[0,5,0.1,0.05], [1,5,0.2,-0.1], [2,5,0.4,0.1], [3,5,0.3,0.2], [4,5,0.5,-0.15], [5,5,11,0.5]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 6x6 lower, nb=2', function t() {
	var tc = lower_6x6_nb2;
	var N = 6;
	var nb = 2;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[0,0,8,0],
		[1,0,1,1], [1,1,7,0.5],
		[2,0,0.5,0], [2,1,0.8,-0.2], [2,2,9,0],
		[3,0,0.3,0.1], [3,1,0.4,0.3], [3,2,0.6,-0.1], [3,3,10,1],
		[4,0,0.2,0], [4,1,0.3,0.1], [4,2,0.5,0.2], [4,3,0.7,-0.3], [4,4,6,0],
		[5,0,0.1,0.05], [5,1,0.2,-0.1], [5,2,0.4,0.1], [5,3,0.3,0.2], [5,4,0.5,-0.15], [5,5,11,0.5]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 5x5 upper with 2x2 pivot', function t() {
	var tc = upper_5x5_2x2pivot;
	var N = 5;
	var nb = 5;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillUpper( Av, N, [
		[0,0,0.01,0],
		[0,1,0.02,0.01], [1,1,0.01,0],
		[0,2,0.5,0.3], [1,2,0.4,-0.2], [2,2,0.01,0],
		[0,3,0.3,0.1], [1,3,0.6,0.2], [2,3,0.7,-0.1], [3,3,5,0],
		[0,4,0.2,0], [1,4,0.3,0.1], [2,4,0.5,0.2], [3,4,0.4,-0.3], [4,4,6,1]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'upper', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});

test( 'zlasyf: 5x5 lower with 2x2 pivot', function t() {
	var tc = lower_5x5_2x2pivot;
	var N = 5;
	var nb = 5;
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var expectedA;
	var expected;
	var result;
	var i;

	fillLower( Av, N, [
		[0,0,6,1],
		[1,0,0.4,-0.3], [1,1,5,0],
		[2,0,0.5,0.2], [2,1,0.7,-0.1], [2,2,0.01,0],
		[3,0,0.3,0.1], [3,1,0.6,0.2], [3,2,0.4,-0.2], [3,3,0.01,0],
		[4,0,0.2,0], [4,1,0.3,0.1], [4,2,0.5,0.3], [4,3,0.02,0.01], [4,4,0.01,0]
	]);

	var W = new Complex128Array( N * nb );
	var IPIV = new Int32Array( N );
	result = zlasyf( 'lower', N, nb, A, 1, N, 0, IPIV, 1, 0, W, 1, N, 0 );
	assert.strictEqual( result.info, tc.info );
	assert.strictEqual( result.kb, tc.kb );
	expectedA = extractA( tc.A, N );
	assertArrayClose( Array.from( Av ), expectedA, 1e-10, 'A' );
	expected = fortranIPIVtoJS( tc.ipiv );
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( IPIV[ i ], expected[ i ], 'ipiv[' + i + ']' );
	}
});
