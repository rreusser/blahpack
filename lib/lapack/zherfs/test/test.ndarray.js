

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

function copyArray( src ) {
	const dst = new Complex128Array( src.length );
	const sv = reinterpret( src, 0 );
	const dv = reinterpret( dst, 0 );
	let i;
	for ( i = 0; i < sv.length; i++ ) {
		dv[ i ] = sv[ i ];
	}
	return dst;
}

// TESTS //

test( 'zherfs: upper_4x4', function t() {
	const tc = upper_4x4;
	const n = 4;
	const nrhs = 1;
	const A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	const AF = copyArray( A );
	const IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0, new Complex128Array( Math.max( 1, n * 32 ) ), 1, 0 );

	const B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ] );
	const X = copyArray( B );
	zhetrs( 'upper', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zherfs( 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: lower_4x4', function t() {
	const tc = lower_4x4;
	const n = 4;
	const nrhs = 1;
	// Column-by-column, lower triangle: col 0 rows 0-3, col 1 rows 1-3, etc.
	const A = packHermitianLower( n, [
		4.0, 0.0, 1.0, -2.0, 3.0, 1.0, 0.5, -0.5,  // col 0
		6.0, 0.0, 2.0, -1.0, 1.0, 2.0,              // col 1
		5.0, 0.0, 3.0, -0.5,                          // col 2
		7.0, 0.0                                       // col 3
	]);
	const AF = copyArray( A );
	const IPIV = new Int32Array( n );
	zhetrf( 'lower', n, AF, 1, n, 0, IPIV, 1, 0, new Complex128Array( Math.max( 1, n * 32 ) ), 1, 0 );

	const B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, -1.0, 3.0, 0.5, -0.5 ] );
	const X = copyArray( B );
	zhetrs( 'lower', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zherfs( 'lower', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: upper_4x4_2rhs', function t() {
	const tc = upper_4x4_2rhs;
	const n = 4;
	const nrhs = 2;
	const A = packHermitianUpper( n, [
		4.0, 0.0,
		1.0, 2.0, 6.0, 0.0,
		3.0, -1.0, 2.0, 1.0, 5.0, 0.0,
		0.5, 0.5, 1.0, -2.0, 3.0, 0.5, 7.0, 0.0
	]);
	const AF = copyArray( A );
	const IPIV = new Int32Array( n );
	zhetrf( 'upper', n, AF, 1, n, 0, IPIV, 1, 0, new Complex128Array( Math.max( 1, n * 32 ) ), 1, 0 );

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

	const X = copyArray( B );
	zhetrs( 'upper', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zherfs( 'upper', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zherfs: n0', function t() {
	const tc = n0;
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const info = zherfs( 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertClose( FERR[ 0 ], tc.ferr[ 0 ], 1e-14, 'ferr' );
	assertClose( BERR[ 0 ], tc.berr[ 0 ], 1e-14, 'berr' );
});

test( 'zherfs: n1', function t() {
	const tc = n1;
	const n = 1;
	const A = new Complex128Array( [ 5.0, 0.0 ] );
	const AF = new Complex128Array( [ 5.0, 0.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const B = new Complex128Array( [ 10.0, 5.0 ] );
	const X = new Complex128Array( [ 2.0, 1.0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = zherfs( 'upper', n, 1, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
});

test( 'zherfs: FERR is normalized by max|X| even when no refinement step is taken (scale invariance)', function t() {
	// A = tridiag(1,4,1) (exactly representable), X is the exact solution and B = A*X exactly, so the residual is zero, BERR = 0, and the refinement loop exits on its first pass (LSTRES still holds its initial 3.0). FERR must then be EST / max_i CABS1(X(i)) with LSTRES reset to zero first; since max(CABS1(X)) = 0.75*scale < 3 for scale = 1, a stale LSTRES would divide by 3 instead. Scaling B and X by a power of two scales EST and max|X| identically, so FERR must be invariant.
	const xs = [ 0.25, 0.125, -0.125, 0.25, 0.5, -0.25 ];
	const bs = [ 0.875, 0.75, 0.25, 0.875, 1.875, -0.75 ];
	const ferr = [];
	const berr = [];
	let scale;
	let info;
	let i;
	let k;
	const A = new Complex128Array( [ 4, 0, 1, 0, 0, 0, 1, 0, 4, 0, 1, 0, 0, 0, 1, 0, 4, 0 ] );
	const AF = new Complex128Array( reinterpret( A, 0 ) );
	const IPIV = new Int32Array( 3 );
	zhetrf( 'upper', 3, AF, 1, 3, 0, IPIV, 1, 0, new Complex128Array( 64 ), 1, 0 );
	for ( k = 0; k < 2; k++ ) {
		scale = ( k === 0 ) ? 1.0 : 8.0;
		const X = new Complex128Array( 3 );
		const B = new Complex128Array( 3 );
		const xv = reinterpret( X, 0 );
		const bv = reinterpret( B, 0 );
		for ( i = 0; i < 6; i++ ) {
			xv[ i ] = scale * xs[ i ];
			bv[ i ] = scale * bs[ i ];
		}
		const FERR = new Float64Array( 1 );
		const BERR = new Float64Array( 1 );
		const WORK = new Complex128Array( 6 );
		const RWORK = new Float64Array( 3 );
		info = zherfs( 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, 'info' );
		ferr.push( FERR[ 0 ] );
		berr.push( BERR[ 0 ] );
	}
	assert.equal( berr[ 0 ], 0.0, 'berr (scale 1)' );
	assert.equal( berr[ 1 ], 0.0, 'berr (scale 8)' );
	assert.ok( ferr[ 1 ] > 0.0, 'ferr > 0' );
	assert.ok( Math.abs( ferr[ 0 ] - ferr[ 1 ] ) <= 1e-12 * ferr[ 1 ], 'ferr invariant under scaling: ' + ferr[ 0 ] + ' vs ' + ferr[ 1 ] ); // eslint-disable-line max-len
});
