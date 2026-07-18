

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zhesvx from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_1rhs from './fixtures/upper_4x4_1rhs.json' with { type: 'json' };
import lower_4x4_2rhs from './fixtures/lower_4x4_2rhs.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import factored_upper_4x4 from './fixtures/factored_upper_4x4.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function packHermitianUpper( n, vals ) {
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let k = 0;
	let i, j;
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
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let k = 0;
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			Av[ (i + j * n) * 2 ] = vals[ k ];
			Av[ (i + j * n) * 2 + 1 ] = vals[ k + 1 ];
			k += 2;
		}
	}
	return A;
}

// TESTS //

test( 'zhesvx: upper_4x4_1rhs', function t() {
	const tc = upper_4x4_1rhs;
	const n = 4;
	const nrhs = 1;
	const A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ] );
	const X = new Complex128Array( n * nrhs );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( Math.max( 1, 2 * n ) );
	const RWORK = new Float64Array( n );

	const info = zhesvx( 'not-factored', 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zhesvx: lower_4x4_2rhs', function t() {
	const tc = lower_4x4_2rhs;
	const n = 4;
	const nrhs = 2;
	// Column-by-column, lower triangle
	const A = packHermitianLower( n, [
		4.0, 0.0, 1.0, -2.0, 3.0, 1.0, 0.5, -0.5,  // col 0
		6.0, 0.0, 2.0, -1.0, 1.0, 2.0,              // col 1
		5.0, 0.0, 3.0, -0.5,                          // col 2
		7.0, 0.0                                       // col 3
	]);
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );

	const B = new Complex128Array( n * nrhs );
	const Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0; Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0; Bv[ 3 ] = 1.0;
	Bv[ 4 ] = -1.0; Bv[ 5 ] = 3.0;
	Bv[ 6 ] = 0.5; Bv[ 7 ] = -0.5;
	Bv[ 8 ] = 0.0; Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 1.0; Bv[ 11 ] = 0.0;
	Bv[ 12 ] = 2.0; Bv[ 13 ] = -1.0;
	Bv[ 14 ] = -1.0; Bv[ 15 ] = 2.0;

	const X = new Complex128Array( n * nrhs );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( Math.max( 1, 2 * n ) );
	const RWORK = new Float64Array( n );

	const info = zhesvx( 'not-factored', 'lower', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zhesvx: n0', function t() {
	const tc = n0;
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );

	const info = zhesvx( 'not-factored', 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
});

test( 'zhesvx: factored_upper_4x4', function t() {
	const tc = factored_upper_4x4;
	const n = 4;
	const nrhs = 1;
	const A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	const AF = new Complex128Array( n * n );
	const AFv = reinterpret( AF, 0 );
	const Av = reinterpret( A, 0 );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		AFv[ i ] = Av[ i ];
	}
	const IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0 );

	const B = new Complex128Array( [ 3.0, 1.0, -1.0, 2.0, 2.0, 0.0, 1.0, -1.0 ] );
	const X = new Complex128Array( n * nrhs );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( Math.max( 1, 2 * n ) );
	const RWORK = new Float64Array( n );

	const info = zhesvx( 'factored', 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});
