// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrf from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import lower_6x6 from './fixtures/lower_6x6.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

function extractSubmatrix( data, n, lda ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out.push( data[ (j * lda * 2) + (i * 2) ] );
			out.push( data[ (j * lda * 2) + (i * 2) + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zhetrf: N=0 quick return', function t() {
	var IPIV;
	var info;
	var A;

	A = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );

	info = zhetrf( 'upper', 0, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetrf: upper_4x4 (fixture, falls through to zhetf2 since N < NB)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = upper_4x4;
	n = 4;

	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,
		1, 2,    5, 0,    0, 0,    0, 0,
		3, -1,   2, 1,    7, 0,    0, 0,
		0.5, 0.5, 1, -2,  3, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetrf: lower_4x4 (fixture)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = lower_4x4;
	n = 4;

	A = new Complex128Array([
		4, 0,    1, -2,   3, 1,    0.5, -0.5,
		0, 0,    5, 0,    2, -1,   1, 2,
		0, 0,    0, 0,    7, 0,    3, 0,
		0, 0,    0, 0,    0, 0,    6, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetrf: lower_6x6 (fixture, with 2x2 pivots)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = lower_6x6;
	n = 6;

	A = new Complex128Array([
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  2, 0,  1, -1,
		0, 0,  0.02, 0,  2, -1,  1, 1,  1.5, -0.5,  0, -3,
		0, 0,  0, 0,  8, 0,  3, 0,  0, 2,  1, 0,
		0, 0,  0, 0,  0, 0,  7, 0,  1, 0.5,  2, -2,
		0, 0,  0, 0,  0, 0,  0, 0,  6, 0,  0.5, 1,
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  5, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetrf: upper N=1', function t() {
	var IPIV;
	var info;
	var A;

	A = new Complex128Array([ 5, 0 ]);
	IPIV = new Int32Array( 1 );

	info = zhetrf( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	assert.equal( IPIV[ 0 ], 0 );
});

test( 'zhetrf: lower N=1', function t() {
	var IPIV;
	var info;
	var A;

	A = new Complex128Array([ 3, 0 ]);
	IPIV = new Int32Array( 1 );

	info = zhetrf( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	assert.equal( IPIV[ 0 ], 0 );
});

test( 'zhetrf: upper 3x3 diag dominant', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	A = new Complex128Array([
		10, 0,   0, 0,    0, 0,
		1, 1,    10, 0,   0, 0,
		0.5, -0.5, 1, 0,  10, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	// All diagonal pivots
	assert.equal( IPIV[ 0 ], 0 );
	assert.equal( IPIV[ 1 ], 1 );
	assert.equal( IPIV[ 2 ], 2 );
});

test( 'zhetrf: lower 3x3 diag dominant', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	A = new Complex128Array([
		10, 0,   1, -1,   0.5, 0.5,
		0, 0,    10, 0,   1, 0,
		0, 0,    0, 0,    10, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	assert.equal( IPIV[ 0 ], 0 );
	assert.equal( IPIV[ 1 ], 1 );
	assert.equal( IPIV[ 2 ], 2 );
});

test( 'zhetrf: upper 6x6 with 2x2 pivots', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 6;

	A = new Complex128Array([
		10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.5, 0.5,  10, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		0.3, -0.3,  0.4, 0.4,  10, 0,  0, 0,  0, 0,  0, 0,
		0.2, 0.1,  0.1, -0.2,  0.5, 0,  10, 0,  0, 0,  0, 0,
		1, 1,  2, -1,  3, 0.5,  1.5, -0.5,  0.01, 0,  0, 0,
		2, -1,  1, 1,  0.5, 0.5,  2, 0,  5, 1,  0.02, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0 );
});

test( 'zhetrf: lower singular', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	A = new Complex128Array([
		0, 0,  0, 0,  0, 0,
		0, 0,  3, 0,  1, -1,
		0, 0,  0, 0,  2, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info > 0, 'singular matrix should return info > 0' );
});

test( 'zhetrf: upper N=34 blocked path (N > NB=32)', function t() {
	// N=34 > NB=32 forces blocked factorization through zlahef
	var IPIV;
	var info;
	var Av;
	var A;
	var n;
	var i;
	var j;

	n = 34;

	A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );

	// Fill upper Hermitian diag-dominant matrix
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				Av[ (j * n + i) * 2 ] = 100;
				Av[ (j * n + i) * 2 + 1 ] = 0;
			} else {
				Av[ (j * n + i) * 2 ] = 0.1 * (j - i);
				Av[ (j * n + i) * 2 + 1 ] = 0.05 * (j - i);
			}
		}
	}

	IPIV = new Int32Array( n );

	info = zhetrf( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zhetrf: lower N=34 blocked path (N > NB=32)', function t() {
	var IPIV;
	var info;
	var Av;
	var A;
	var n;
	var i;
	var j;

	n = 34;

	A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );

	// Fill lower Hermitian diag-dominant matrix
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				Av[ (j * n + i) * 2 ] = 100;
				Av[ (j * n + i) * 2 + 1 ] = 0;
			} else {
				Av[ (j * n + i) * 2 ] = 0.1 * (i - j);
				Av[ (j * n + i) * 2 + 1 ] = -0.05 * (i - j);
			}
		}
	}

	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zhetrf: lower N=34 with 2x2 pivots in blocked path', function t() {
	var IPIV;
	var info;
	var has2x2;
	var Av;
	var A;
	var n;
	var i;
	var j;

	n = 34;

	A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );

	// Fill lower Hermitian with small diag at start to force 2x2 pivots
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				Av[ (j * n + i) * 2 ] = ( j < 2 ) ? 0.01 : 100;
				Av[ (j * n + i) * 2 + 1 ] = 0;
			} else {
				Av[ (j * n + i) * 2 ] = ( i < 3 && j < 3 ) ? (5 * (i - j)) : (0.1 * (i - j));
				Av[ (j * n + i) * 2 + 1 ] = ( i < 3 && j < 3 ) ? (-1) : (0.05);
			}
		}
	}

	IPIV = new Int32Array( n );

	info = zhetrf( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0 );

	// Check for 2x2 pivots
	has2x2 = false;
	for ( i = 0; i < n; i++ ) {
		if ( IPIV[ i ] < 0 ) {
			has2x2 = true;
			break;
		}
	}
	assert.ok( has2x2, 'should have 2x2 pivots in blocked path' );
});

test( 'zhetrf: upper singular', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	A = new Complex128Array([
		0, 0,  0, 0,  0, 0,
		0, 0,  3, 0,  0, 0,
		0, 0,  1, 1,  2, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetrf( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info > 0, 'singular matrix should return info > 0' );
});
