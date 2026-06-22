

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zhetrs from './../../zhetrs/lib/base.js';
import zherfs from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4_2rhs from './fixtures/upper_4x4_2rhs.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };

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

function packHermitianUpper( n, vals ) {
	var A = new Complex128Array( n * n );
	var Av = reinterpret( A, 0 );
	var k = 0;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			Av[ (i + j * n) * 2 ] = vals[ k ];
			Av[ (i + j * n) * 2 + 1 ] = vals[ k + 1 ];
			k += 2;
		}
	}
	return A;
}

function packHermitianLower( n, vals ) {
	var A = new Complex128Array( n * n );
	var Av = reinterpret( A, 0 );
	var k = 0;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			Av[ (i + j * n) * 2 ] = vals[ k ];
			Av[ (i + j * n) * 2 + 1 ] = vals[ k + 1 ];
			k += 2;
		}
	}
	return A;
}

function copyArray( src ) {
	var dst = new Complex128Array( src.length );
	var sv = reinterpret( src, 0 );
	var dv = reinterpret( dst, 0 );
	var i;
	for ( i = 0; i < sv.length; i++ ) {
		dv[ i ] = sv[ i ];
	}
	return dst;
}

// TESTS //

test( 'zherfs: upper_4x4', function t() {
	var tc = upper_4x4;
	var n = 4;
	var nrhs = 1;
	var A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	var AF = copyArray( A );
	var IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0 );

	var B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ] );
	var X = copyArray( B );
	zhetrs( 'upper', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( 2 * n );
	var RWORK = new Float64Array( n );
	var info = zherfs( 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: lower_4x4', function t() {
	var tc = lower_4x4;
	var n = 4;
	var nrhs = 1;
	// Column-by-column, lower triangle: col 0 rows 0-3, col 1 rows 1-3, etc.
	var A = packHermitianLower( n, [
		4.0, 0.0, 1.0, -2.0, 3.0, 1.0, 0.5, -0.5,  // col 0
		6.0, 0.0, 2.0, -1.0, 1.0, 2.0,              // col 1
		5.0, 0.0, 3.0, -0.5,                          // col 2
		7.0, 0.0                                       // col 3
	]);
	var AF = copyArray( A );
	var IPIV = new Int32Array( n );
	zhetrf( 'lower', n, AF, 1, n, 0, IPIV, 1, 0 );

	var B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ] );
	var X = copyArray( B );
	zhetrs( 'lower', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( 2 * n );
	var RWORK = new Float64Array( n );
	var info = zherfs( 'lower', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: upper_4x4_2rhs', function t() {
	var tc = upper_4x4_2rhs;
	var n = 4;
	var nrhs = 2;
	var A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	var AF = copyArray( A );
	var IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0 );

	var B = new Complex128Array( n * nrhs );
	var Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0; Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0; Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5; Bv[ 7 ] = -0.5;
	Bv[ 8 ] = 0.0; Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 1.0; Bv[ 11 ] = 0.0;
	Bv[ 12 ] = 2.0; Bv[ 13 ] = -1.0;
	Bv[ 14 ] = -1.0; Bv[ 15 ] = 2.0;

	var X = copyArray( B );
	zhetrs( 'upper', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( 2 * n );
	var RWORK = new Float64Array( n );
	var info = zherfs( 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: n0', function t() {
	var tc = n0;
	var A = new Complex128Array( 1 );
	var AF = new Complex128Array( 1 );
	var IPIV = new Int32Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var info = zherfs( 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( FERR[ 0 ], tc.ferr[ 0 ], 1e-14, 'ferr' );
	assertClose( BERR[ 0 ], tc.berr[ 0 ], 1e-14, 'berr' );
});

test( 'zherfs: n1', function t() {
	var tc = n1;
	var n = 1;
	var A = new Complex128Array( [ 5.0, 0.0 ] );
	var AF = new Complex128Array( [ 5.0, 0.0 ] );
	var IPIV = new Int32Array( [ 0 ] );
	var B = new Complex128Array( [ 10.0, 5.0 ] );
	var X = new Complex128Array( [ 2.0, 1.0 ] );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = zherfs( 'upper', n, 1, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
});
