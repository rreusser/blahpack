// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zstein from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_all from './fixtures/basic_5x5_all.json' with { type: 'json' };
import partial_2of5 from './fixtures/partial_2of5.json' with { type: 'json' };
import two_blocks from './fixtures/two_blocks.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Extract real parts of column j (0-based) from interleaved complex column-major array.
* Each complex element is 2 doubles. N rows, stride = 2*N per column.
*/
function getRealColumn( zv, N, j ) {
	const col = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		col[ i ] = zv[ j * 2 * N + i * 2 ]; // real part
	}
	return col;
}

function dot( a, b ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < a.length; i++ ) {
		s += a[ i ] * b[ i ];
	}
	return s;
}

function checkOrthogonalityComplex( zv, N, M, tol ) {
	let ci, cj, v, expected, i, j;
	for ( i = 0; i < M; i++ ) {
		ci = getRealColumn( zv, N, i );
		for ( j = i; j < M; j++ ) {
			cj = getRealColumn( zv, N, j );
			v = dot( ci, cj );
			expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( v, expected, tol, 'Z(:,' + i + ')^H * Z(:,' + j + ')' );
		}
	}
}

// TESTS //

test( 'zstein: basic 5x5, all eigenvectors', function t() {
	const tc = basic_5x5_all;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Complex128Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );

	// strides for Z: column-major, each element is 1 complex, stride1=1, stride2=N
	const info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );

	const zv = reinterpret( Z, 0 );

	// Check imaginary parts are zero
	let i, j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			assertClose( zv[ j * 2 * N + i * 2 + 1 ], 0.0, 1e-14, 'imag Z[' + i + ',' + j + ']' );
		}
	}

	// Check orthogonality
	checkOrthogonalityComplex( zv, N, M, 1e-12 );

	// Compare real parts against fixture (accounting for sign)
	for ( j = 0; j < M; j++ ) {
		const colActual = getRealColumn( zv, N, j );
		const colExpected = getRealColumn( tc.Z, N, j );
		let sign = 1.0;
		for ( i = 0; i < N; i++ ) {
			if ( Math.abs( colExpected[ i ] ) > 1e-10 ) {
				sign = ( colActual[ i ] * colExpected[ i ] > 0 ) ? 1.0 : -1.0;
				break;
			}
		}
		for ( i = 0; i < N; i++ ) {
			assertClose( colActual[ i ] * sign, colExpected[ i ], 1e-12, 'Z[' + i + ',' + j + ']' );
		}
	}
});

test( 'zstein: partial 2 of 5 eigenvectors', function t() {
	const tc = partial_2of5;
	const N = 5;
	const M = 2;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( [ 1, 1 ] );
	const ISPLIT = new Int32Array( [ 5 ] );
	const Z = new Complex128Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );

	const info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0 ], 'ifail' );

	const zv = reinterpret( Z, 0 );
	checkOrthogonalityComplex( zv, N, M, 1e-12 );
});

test( 'zstein: N=1', function t() {
	const N = 1;
	const M = 1;
	const d = new Float64Array( [ 3.0 ] );
	const e = new Float64Array( 0 );
	const w = new Float64Array( [ 3.0 ] );
	const IBLOCK = new Int32Array( [ 1 ] );
	const ISPLIT = new Int32Array( [ 1 ] );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 5 );
	const IWORK = new Int32Array( 1 );
	const IFAIL = new Int32Array( 1 );

	const info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	const zv = reinterpret( Z, 0 );
	assertClose( zv[ 0 ], 1.0, 1e-14, 'Z real' );
	assertClose( zv[ 1 ], 0.0, 1e-14, 'Z imag' );
});

test( 'zstein: N=0', function t() {
	const info = zstein( 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );

	assert.equal( info, 0, 'info' );
});

test( 'zstein: two blocks', function t() {
	const tc = two_blocks;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 4.0, 4.0, 4.0, 3.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 0.0, 0.5 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Complex128Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );

	const info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );

	const zv = reinterpret( Z, 0 );

	// Verify block structure
	let i, j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 3; i < 5; i++ ) {
			assertClose( zv[ j * 2 * N + i * 2 ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] real should be zero' );
		}
	}
	for ( j = 3; j < 5; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			assertClose( zv[ j * 2 * N + i * 2 ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] real should be zero' );
		}
	}
});
