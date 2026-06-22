/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetf2Rook from './../lib/zhetf2_rook.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array2 from '@stdlib/array/int32/lib/index.js';


// TESTS //

test( 'zhetf2Rook is a function', function t() {
	assert.strictEqual( typeof zhetf2Rook, 'function', 'is a function' );
});

test( 'zhetf2Rook has expected arity', function t() {
	assert.strictEqual( zhetf2Rook.length, 8, 'has expected arity' );
});

test( 'zhetf2Rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetf2Rook( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhetf2Rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetf2Rook( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhetf2Rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetf2Rook( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});

test( 'zhetf2Rook throws RangeError for LDA < max(1,N) in row-major', function t() {
	assert.throws( function throws() {
		// LDA=1 with N=3 (row-major) is invalid.
		zhetf2Rook( 'row-major', 'upper', 3, new Float64Array( 36 ), 1, 1, 1, 0 );
	}, RangeError );
});

test( 'zhetf2Rook accepts column-major and returns 0 for valid input', function t() {
	var info;
	var A = new Complex128Array([ 4, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0, 0.5, -0.25, 0.5, 1, 5, 0 ]);
	var IPIV = new Int32Array2( 3 );
	info = zhetf2Rook( 'column-major', 'upper', 3, A, 3, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetf2Rook accepts row-major and returns 0 for valid input', function t() {
	var info;
	// Same matrix transposed (Hermitian, lower triangle stored).
	var A = new Complex128Array([ 4, 0, 1, -0.5, 0.5, 0.25, 0, 0, 3, 0, 0.5, -1, 0, 0, 0, 0, 5, 0 ]);
	var IPIV = new Int32Array2( 3 );
	info = zhetf2Rook( 'row-major', 'lower', 3, A, 3, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});
