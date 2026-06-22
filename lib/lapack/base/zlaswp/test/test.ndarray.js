import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaswp from './../lib/index.js';

// FIXTURES //

import basic_forward from './fixtures/basic_forward.json' with { type: 'json' };
import no_swap from './fixtures/no_swap.json' with { type: 'json' };
import reverse_pivots from './fixtures/reverse_pivots.json' with { type: 'json' };
import incx_zero from './fixtures/incx_zero.json' with { type: 'json' };
import two_swaps from './fixtures/two_swaps.json' with { type: 'json' };
import block_tiled from './fixtures/block_tiled.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.equal( actual[i], expected[i], msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zlaswp: main export is a function', function t() {
	assert.strictEqual( typeof zlaswp, 'function' );
});

test( 'zlaswp: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlaswp.ndarray, 'function' );
});

// Note: base.js uses 0-based k1/k2 and 0-based IPIV values.
// Fortran uses 1-based, so we convert in the test inputs.

test( 'zlaswp.ndarray performs forward row interchanges', function t() {
	var tc = basic_forward;
	// A = [(1+2i) (7+8i); (3+4i) (9+10i); (5+6i) (11+12i)] col-major (3x2)
	// Fortran: ipiv=[3,2] k1=1 k2=2 => 0-based: ipiv=[2,1] k1=0 k2=1
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var ipiv = new Int32Array( [ 2, 1 ] );
	zlaswp.ndarray( 2, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 1 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'basic_forward' );
});

test( 'zlaswp.ndarray is a no-op when ipiv(k) == k', function t() {
	var tc = no_swap;
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var ipiv = new Int32Array( [ 0, 1 ] );
	zlaswp.ndarray( 2, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 1 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'no_swap' );
});

test( 'zlaswp.ndarray performs reverse row interchanges (incx=-1)', function t() {
	var tc = reverse_pivots;
	// Same matrix, Fortran ipiv=[3,2] with incx=-1
	// 0-based: ipiv=[2,1], k1=1 k2=0, incx=-1
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var ipiv = new Int32Array( [ 2, 1 ] );
	zlaswp.ndarray( 2, a, 1, 3, 0, 1, 0, ipiv, 1, 0, -1 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'reverse_pivots' );
});

test( 'zlaswp.ndarray is a no-op when incx=0', function t() {
	var tc = incx_zero;
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var ipiv = new Int32Array( [ 2 ] );
	zlaswp.ndarray( 2, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 0 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'incx_zero' );
});

test( 'zlaswp.ndarray applies sequential swaps', function t() {
	var tc = two_swaps;
	// 3x1 complex matrix: (10+1i), (20+2i), (30+3i)
	// Fortran: ipiv=[2,3] k1=1 k2=2 => 0-based: ipiv=[1,2] k1=0 k2=1
	var a = new Complex128Array( [ 10, 1, 20, 2, 30, 3 ] );
	var ipiv = new Int32Array( [ 1, 2 ] );
	zlaswp.ndarray( 1, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 1 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'two_swaps' );
});

test( 'zlaswp.ndarray exercises block-tiled path (N=40 > 32 columns)', function t() {
	var tc = block_tiled;
	// 3x40 complex matrix, col-major: a(i) = cmplx(i, i+0.5) for i=1..120
	var data = [];
	var i;
	for ( i = 1; i <= 120; i++ ) {
		data.push( i );
		data.push( i + 0.5 );
	}
	var a = new Complex128Array( data );
	// Fortran: ipiv=[3,2] k1=1 k2=2 => 0-based: ipiv=[2,1] k1=0 k2=1
	var ipiv = new Int32Array( [ 2, 1 ] );
	zlaswp.ndarray( 40, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 1 );
	var view = reinterpret( a, 0 );
	assertArrayClose( Array.from( view ), tc.a, 'block_tiled' );
});

test( 'zlaswp.ndarray returns the input array', function t() {
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	var ipiv = new Int32Array( [ 2, 1 ] );
	var result = zlaswp.ndarray( 2, a, 1, 3, 0, 0, 1, ipiv, 1, 0, 1 );
	assert.strictEqual( result, a );
});

test( 'zlaswp.ndarray N=0 is a no-op', function t() {
	var a = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	var ipiv = new Int32Array( [ 2 ] );
	zlaswp.ndarray( 0, a, 1, 3, 0, 0, 0, ipiv, 1, 0, 1 );
	var view = reinterpret( a, 0 );
	// Should be unchanged since N=0
	assert.equal( view[0], 1 );
	assert.equal( view[1], 2 );
});
