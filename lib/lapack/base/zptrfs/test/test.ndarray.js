// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zptrfs from './../lib/ndarray.js';
import zpttrf from '../../zpttrf/lib/base.js';
import zpttrs from '../../zpttrs/lib/base.js';

// FIXTURES //

import upper_n5_nrhs1 from './fixtures/upper_n5_nrhs1.json' with { type: 'json' };
import lower_n5_nrhs1 from './fixtures/lower_n5_nrhs1.json' with { type: 'json' };
import upper_n4_nrhs2 from './fixtures/upper_n4_nrhs2.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };

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

/**
* Helper: compute b = A*x_true for Hermitian tridiag with UPLO='U'.
* A(i,i) = d(i), A(i,i+1) = e(i), A(i+1,i) = conj(e(i)).
* Returns interleaved Float64 array of b.
*/
function hermTridiagMatvecUpper( d, eInterleaved, xInterleaved, n ) {
	var b = new Float64Array( 2 * n );
	var i;
	var er;
	var ei;
	var xr;
	var xi;
	var cxr;
	var cxi;
	var exr;
	var exi;
	for ( i = 0; i < n; i++ ) {
		// D(i)*X(i)
		b[ 2 * i ] = d[ i ] * xInterleaved[ 2 * i ];
		b[ 2 * i + 1 ] = d[ i ] * xInterleaved[ 2 * i + 1 ];

		if ( i > 0 ) {
			// conj(E(i-1))*X(i-1)
			er = eInterleaved[ 2 * ( i - 1 ) ];
			ei = eInterleaved[ 2 * ( i - 1 ) + 1 ];
			xr = xInterleaved[ 2 * ( i - 1 ) ];
			xi = xInterleaved[ 2 * ( i - 1 ) + 1 ];
			cxr = er * xr + ei * xi; // conj(e)*x
			cxi = er * xi - ei * xr;
			b[ 2 * i ] += cxr;
			b[ 2 * i + 1 ] += cxi;
		}
		if ( i < n - 1 ) {
			// E(i)*X(i+1)
			er = eInterleaved[ 2 * i ];
			ei = eInterleaved[ 2 * i + 1 ];
			xr = xInterleaved[ 2 * ( i + 1 ) ];
			xi = xInterleaved[ 2 * ( i + 1 ) + 1 ];
			exr = er * xr - ei * xi;
			exi = er * xi + ei * xr;
			b[ 2 * i ] += exr;
			b[ 2 * i + 1 ] += exi;
		}
	}
	return b;
}

/**
* Helper: compute b = A*x_true for Hermitian tridiag with UPLO='L'.
* A(i,i) = d(i), A(i+1,i) = e(i), A(i,i+1) = conj(e(i)).
*/
function hermTridiagMatvecLower( d, eInterleaved, xInterleaved, n ) {
	var b = new Float64Array( 2 * n );
	var i;
	var er;
	var ei;
	var xr;
	var xi;
	var cxr;
	var cxi;
	var exr;
	var exi;
	for ( i = 0; i < n; i++ ) {
		b[ 2 * i ] = d[ i ] * xInterleaved[ 2 * i ];
		b[ 2 * i + 1 ] = d[ i ] * xInterleaved[ 2 * i + 1 ];

		if ( i > 0 ) {
			// E(i-1)*X(i-1) (E stores subdiagonal)
			er = eInterleaved[ 2 * ( i - 1 ) ];
			ei = eInterleaved[ 2 * ( i - 1 ) + 1 ];
			xr = xInterleaved[ 2 * ( i - 1 ) ];
			xi = xInterleaved[ 2 * ( i - 1 ) + 1 ];
			cxr = er * xr - ei * xi;
			cxi = er * xi + ei * xr;
			b[ 2 * i ] += cxr;
			b[ 2 * i + 1 ] += cxi;
		}
		if ( i < n - 1 ) {
			// conj(E(i))*X(i+1) (superdiagonal = conj of E)
			er = eInterleaved[ 2 * i ];
			ei = eInterleaved[ 2 * i + 1 ];
			xr = xInterleaved[ 2 * ( i + 1 ) ];
			xi = xInterleaved[ 2 * ( i + 1 ) + 1 ];
			exr = er * xr + ei * xi;
			exi = er * xi - ei * xr;
			b[ 2 * i ] += exr;
			b[ 2 * i + 1 ] += exi;
		}
	}
	return b;
}

// TESTS //

test( 'zptrfs: upper_n5_nrhs1', function t() {
	var tc = upper_n5_nrhs1;
	var n = 5;
	var nrhs = 1;

	var d = new Float64Array( [ 4, 3, 2, 5, 4 ] );
	var eData = new Float64Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1, -0.2, 0.3 ] );
	var e = new Complex128Array( eData.buffer );

	// x_true = (1+i, 2-i, 3+0.5i, -1+2i, 0.5-0.5i)
	var xt = new Float64Array( [ 1, 1, 2, -1, 3, 0.5, -1, 2, 0.5, -0.5 ] );
	var bData = hermTridiagMatvecUpper( d, eData, xt, n );
	var b = new Complex128Array( bData.buffer );

	// Factor
	var df = new Float64Array( d );
	var efData = new Float64Array( eData );
	var ef = new Complex128Array( efData.buffer );
	zpttrf( n, df, 1, 0, ef, 1, 0 );

	// Solve
	var xData = new Float64Array( bData );
	var x = new Complex128Array( xData.buffer );
	zpttrs( 'upper', n, nrhs, df, 1, 0, ef, 1, 0, x, 1, n, 0 );

	// Perturb
	xData[ 0 ] += 1e-10;
	xData[ 1 ] -= 1e-10;
	xData[ 4 ] -= 1e-10;
	xData[ 5 ] += 1e-10;

	var ferr = new Float64Array( nrhs );
	var berr = new Float64Array( nrhs );
	var work = new Complex128Array( n );
	var rwork = new Float64Array( n );

	var info = zptrfs( 'upper', n, nrhs, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( xData ), tc.x, 1e-12, 'x' );
	assert.ok( berr[ 0 ] < 1e-13, 'berr is small: ' + berr[ 0 ] );
});

test( 'zptrfs: lower_n5_nrhs1', function t() {
	var tc = lower_n5_nrhs1;
	var n = 5;
	var nrhs = 1;

	var d = new Float64Array( [ 4, 3, 2, 5, 4 ] );
	var eData = new Float64Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1, -0.2, 0.3 ] );
	var e = new Complex128Array( eData.buffer );

	// Compute b using UPPER convention (matching Fortran test)
	var xt = new Float64Array( [ 1, 1, 2, -1, 3, 0.5, -1, 2, 0.5, -0.5 ] );
	var bData = hermTridiagMatvecUpper( d, eData, xt, n );
	var b = new Complex128Array( bData.buffer );

	// Factor (zpttrf always does L*D*L^H, independent of UPLO)
	var df = new Float64Array( d );
	var efData = new Float64Array( eData );
	var ef = new Complex128Array( efData.buffer );
	zpttrf( n, df, 1, 0, ef, 1, 0 );

	// Solve with UPLO='L' — zpttrs interprets EF differently, giving a different x
	var xData = new Float64Array( bData );
	var x = new Complex128Array( xData.buffer );
	zpttrs( 'lower', n, nrhs, df, 1, 0, ef, 1, 0, x, 1, n, 0 );

	// Perturb
	xData[ 2 ] += 1e-10;
	xData[ 3 ] += 1e-10;
	xData[ 6 ] -= 1e-10;
	xData[ 7 ] += 1e-10;

	var ferr = new Float64Array( nrhs );
	var berr = new Float64Array( nrhs );
	var work = new Complex128Array( n );
	var rwork = new Float64Array( n );

	var info = zptrfs( 'lower', n, nrhs, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	// Lower path: the matrix A_lower differs from A_upper when E has nonzero imag parts.
	// The fixture captures the refined x for this specific setup.
	assertArrayClose( Array.from( xData ), tc.x, 1e-12, 'x' );
	assert.ok( berr[ 0 ] < 1e-13, 'berr is small: ' + berr[ 0 ] );
});

test( 'zptrfs: upper_n4_nrhs2', function t() {
	var tc = upper_n4_nrhs2;
	var n = 4;
	var nrhs = 2;

	var d = new Float64Array( [ 5, 4, 3, 6 ] );
	var eData = new Float64Array( [ 1, 0.5, -0.5, 0.3, 0.2, -0.4 ] );
	var e = new Complex128Array( eData.buffer );

	// x_true col1 = (1, 2i, -1+i, 3), col2 = (i, 1-i, 2, -1+0.5i)
	var xt1 = new Float64Array( [ 1, 0, 0, 2, -1, 1, 3, 0 ] );
	var xt2 = new Float64Array( [ 0, 1, 1, -1, 2, 0, -1, 0.5 ] );

	var b1 = hermTridiagMatvecUpper( d, eData, xt1, n );
	var b2 = hermTridiagMatvecUpper( d, eData, xt2, n );

	// Column-major layout: col1 then col2
	var bData = new Float64Array( 2 * n * nrhs );
	var xData = new Float64Array( 2 * n * nrhs );
	var i;
	for ( i = 0; i < 2 * n; i++ ) {
		bData[ i ] = b1[ i ];
		bData[ 2 * n + i ] = b2[ i ];
	}

	var b = new Complex128Array( bData.buffer );
	var df = new Float64Array( d );
	var efData = new Float64Array( eData );
	var ef = new Complex128Array( efData.buffer );
	zpttrf( n, df, 1, 0, ef, 1, 0 );

	for ( i = 0; i < bData.length; i++ ) {
		xData[ i ] = bData[ i ];
	}
	var x = new Complex128Array( xData.buffer );
	zpttrs( 'upper', n, nrhs, df, 1, 0, ef, 1, 0, x, 1, n, 0 );

	// Perturb
	xData[ 0 ] += 1e-10;
	xData[ 2 * n + 1 ] -= 1e-10;

	var ferr = new Float64Array( nrhs );
	var berr = new Float64Array( nrhs );
	var work = new Complex128Array( n );
	var rwork = new Float64Array( n );

	var info = zptrfs( 'upper', n, nrhs, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( xData ), tc.x, 1e-12, 'x' );
	assert.ok( berr[ 0 ] < 1e-13, 'berr[0] is small: ' + berr[ 0 ] );
	assert.ok( berr[ 1 ] < 1e-13, 'berr[1] is small: ' + berr[ 1 ] );
});

test( 'zptrfs: n_eq_1', function t() {
	var tc = n_eq_1;
	var n = 1;
	var nrhs = 1;

	var d = new Float64Array( [ 3 ] );
	var e = new Complex128Array( 0 );

	var bData = new Float64Array( [ 9, 6 ] );
	var b = new Complex128Array( bData.buffer );

	var df = new Float64Array( d );
	var ef = new Complex128Array( 0 );
	zpttrf( n, df, 1, 0, ef, 1, 0 );

	var xData = new Float64Array( bData );
	var x = new Complex128Array( xData.buffer );
	zpttrs( 'upper', n, nrhs, df, 1, 0, ef, 1, 0, x, 1, 1, 0 );

	var ferr = new Float64Array( 1 );
	var berr = new Float64Array( 1 );
	var work = new Complex128Array( n );
	var rwork = new Float64Array( n );

	var info = zptrfs( 'upper', n, nrhs, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( xData ), tc.x, 1e-14, 'x' );
	assert.equal( berr[ 0 ], 0.0, 'berr is zero for exact solve' );
});

test( 'zptrfs: n_eq_1 lower', function t() {
	var n = 1;
	var nrhs = 1;

	var d = new Float64Array( [ 3 ] );
	var e = new Complex128Array( 0 );

	var bData = new Float64Array( [ 9, 6 ] );
	var b = new Complex128Array( bData.buffer );

	var df = new Float64Array( d );
	var ef = new Complex128Array( 0 );
	zpttrf( n, df, 1, 0, ef, 1, 0 );

	var xData = new Float64Array( bData );
	var x = new Complex128Array( xData.buffer );
	zpttrs( 'lower', n, nrhs, df, 1, 0, ef, 1, 0, x, 1, 1, 0 );

	var ferr = new Float64Array( 1 );
	var berr = new Float64Array( 1 );
	var work = new Complex128Array( n );
	var rwork = new Float64Array( n );

	var info = zptrfs( 'lower', n, nrhs, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	assertClose( xData[ 0 ], 3.0, 1e-14, 'x re' );
	assertClose( xData[ 1 ], 2.0, 1e-14, 'x im' );
	assert.equal( berr[ 0 ], 0.0, 'berr is zero for exact solve' );
});

test( 'zptrfs: n_eq_0', function t() {
	var d = new Float64Array( 0 );
	var e = new Complex128Array( 0 );
	var df = new Float64Array( 0 );
	var ef = new Complex128Array( 0 );
	var b = new Complex128Array( 0 );
	var x = new Complex128Array( 0 );
	var ferr = new Float64Array( 1 );
	var berr = new Float64Array( 1 );
	var work = new Complex128Array( 0 );
	var rwork = new Float64Array( 0 );

	var info = zptrfs( 'upper', 0, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.equal( ferr[ 0 ], 0.0, 'ferr zeroed' );
	assert.equal( berr[ 0 ], 0.0, 'berr zeroed' );
});

test( 'zptrfs: nrhs_eq_0', function t() {
	var d = new Float64Array( [ 4, 3, 2, 5, 4 ] );
	var eData = new Float64Array( [ 0.5, 0.1, -0.3, 0.2, 0.4, -0.1, -0.2, 0.3 ] );
	var e = new Complex128Array( eData.buffer );
	var df = new Float64Array( d );
	var efData = new Float64Array( eData );
	var ef = new Complex128Array( efData.buffer );
	var b = new Complex128Array( 5 );
	var x = new Complex128Array( 5 );
	var ferr = new Float64Array( 0 );
	var berr = new Float64Array( 0 );
	var work = new Complex128Array( 5 );
	var rwork = new Float64Array( 5 );

	var info = zptrfs( 'upper', 5, 0, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 5, 0, x, 1, 5, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 );

	assert.equal( info, 0, 'info' );
});
