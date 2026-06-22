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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Extract real parts of column j (0-based) from interleaved complex column-major array.
* Each complex element is 2 doubles. N rows, stride = 2*N per column.
*/
function getRealColumn( zv, N, j ) {
	var col = new Float64Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		col[ i ] = zv[ j * 2 * N + i * 2 ]; // real part
	}
	return col;
}

function dot( a, b ) {
	var s = 0.0;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		s += a[ i ] * b[ i ];
	}
	return s;
}

function checkOrthogonalityComplex( zv, N, M, tol ) {
	var ci;
	var cj;
	var v;
	var expected;
	var i;
	var j;
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
	var tc = basic_5x5_all;
	var N = 5;
	var M = 5;
	var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var w = new Float64Array( tc.w );
	var IBLOCK = new Int32Array( tc.iblock );
	var ISPLIT = new Int32Array( tc.isplit );
	var Z = new Complex128Array( N * M );
	var WORK = new Float64Array( 5 * N );
	var IWORK = new Int32Array( N );
	var IFAIL = new Int32Array( M );

	// strides for Z: column-major, each element is 1 complex, stride1=1, stride2=N
	var info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );

	var zv = reinterpret( Z, 0 );

	// Check imaginary parts are zero
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			assertClose( zv[ j * 2 * N + i * 2 + 1 ], 0.0, 1e-14, 'imag Z[' + i + ',' + j + ']' );
		}
	}

	// Check orthogonality
	checkOrthogonalityComplex( zv, N, M, 1e-12 );

	// Compare real parts against fixture (accounting for sign)
	for ( j = 0; j < M; j++ ) {
		var colActual = getRealColumn( zv, N, j );
		var colExpected = getRealColumn( tc.Z, N, j );
		var sign = 1.0;
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
	var tc = partial_2of5;
	var N = 5;
	var M = 2;
	var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var w = new Float64Array( tc.w );
	var IBLOCK = new Int32Array( [ 1, 1 ] );
	var ISPLIT = new Int32Array( [ 5 ] );
	var Z = new Complex128Array( N * M );
	var WORK = new Float64Array( 5 * N );
	var IWORK = new Int32Array( N );
	var IFAIL = new Int32Array( M );

	var info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0 ], 'ifail' );

	var zv = reinterpret( Z, 0 );
	checkOrthogonalityComplex( zv, N, M, 1e-12 );
});

test( 'zstein: N=1', function t() {
	var N = 1;
	var M = 1;
	var d = new Float64Array( [ 3.0 ] );
	var e = new Float64Array( 0 );
	var w = new Float64Array( [ 3.0 ] );
	var IBLOCK = new Int32Array( [ 1 ] );
	var ISPLIT = new Int32Array( [ 1 ] );
	var Z = new Complex128Array( 1 );
	var WORK = new Float64Array( 5 );
	var IWORK = new Int32Array( 1 );
	var IFAIL = new Int32Array( 1 );

	var info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	var zv = reinterpret( Z, 0 );
	assertClose( zv[ 0 ], 1.0, 1e-14, 'Z real' );
	assertClose( zv[ 1 ], 0.0, 1e-14, 'Z imag' );
});

test( 'zstein: N=0', function t() {
	var info = zstein( 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );

	assert.equal( info, 0, 'info' );
});

test( 'zstein: two blocks', function t() {
	var tc = two_blocks;
	var N = 5;
	var M = 5;
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 3.0, 3.0 ] );
	var e = new Float64Array( [ 1.0, 1.0, 0.0, 0.5 ] );
	var w = new Float64Array( tc.w );
	var IBLOCK = new Int32Array( tc.iblock );
	var ISPLIT = new Int32Array( tc.isplit );
	var Z = new Complex128Array( N * M );
	var WORK = new Float64Array( 5 * N );
	var IWORK = new Int32Array( N );
	var IFAIL = new Int32Array( M );

	var info = zstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	assert.equal( info, 0, 'info' );
	assert.deepEqual( Array.from( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );

	var zv = reinterpret( Z, 0 );

	// Verify block structure
	var i;
	var j;
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
