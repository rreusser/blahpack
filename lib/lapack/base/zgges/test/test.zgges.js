

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from './../lib/zgges.js';


// FUNCTIONS //

function nosel() {
	return false;
}


// TESTS //

test( 'zgges is a function', function t() {
	assert.strictEqual( typeof zgges, 'function', 'is a function' );
});

test( 'zgges: column-major basic 2x2 no-vectors', function t() {
	var N = 2;
	var A = new Complex128Array( N * N );
	var B = new Complex128Array( N * N );
	var av = reinterpret( A, 0 );
	var bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( 1 + N ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	var ALPHA = new Complex128Array( N );
	var BETA = new Complex128Array( N );
	var VSL = new Complex128Array( N * N );
	var VSR = new Complex128Array( N * N );
	var res = zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, N, A, N, B, N, ALPHA, BETA, VSL, N, VSR, N );
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: row-major basic 2x2 with vectors', function t() {
	var N = 2;
	var A = new Complex128Array( N * N );
	var B = new Complex128Array( N * N );
	var av = reinterpret( A, 0 );
	var bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( N + 1 ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( N + 1 ) ] = 1.0;
	var ALPHA = new Complex128Array( N );
	var BETA = new Complex128Array( N );
	var VSL = new Complex128Array( N * N );
	var VSR = new Complex128Array( N * N );
	var res = zgges( 'row-major', 'compute-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, N, B, N, ALPHA, BETA, VSL, N, VSR, N );
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges has expected arity', function t() {
	assert.strictEqual( zgges.length, 16, 'has expected arity' );
});

test( 'zgges throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgges( 'invalid', 'no-vectors', 'no-vectors', 'not-sorted', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgges throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDA < N', function t() {
	assert.throws( function throws() {
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDB < N', function t() {
	assert.throws( function throws() {
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDVSL < 1', function t() {
	assert.throws( function throws() {
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDVSR < 1', function t() {
	assert.throws( function throws() {
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'not-sorted', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), new Complex128Array( 2 ), new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0 );
	}, RangeError );
});
