/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztprfb from './../lib/ztprfb.js';
import main from './../lib/index.js';


// TESTS //

test( 'ztprfb is a function', function t() {
	assert.strictEqual( typeof ztprfb, 'function', 'is a function' );
});

test( 'ztprfb has expected arity', function t() {
	assert.strictEqual( ztprfb.length, 19, 'has expected arity' );
});

test( 'ztprfb throws TypeError for invalid order', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'invalid', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid side', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'invalid', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid trans', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'invalid', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws RangeError for negative M', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', -1, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative N', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, -1, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative K', function t() {
	var V = new Complex128Array( 15 );
	var T = new Complex128Array( 9 );
	var A = new Complex128Array( 12 );
	var B = new Complex128Array( 20 );
	var W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, -1, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDV (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDV (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 1, new Complex128Array( 9 ), 3, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDT (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDT (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDA (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 1, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDA (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 1, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDB (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 1, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDB (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 1, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDWORK (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 1 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDWORK (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 1 );
	}, RangeError );
});

test( 'ztprfb column-major path executes (K=0 quick exit)', function t() {
	var out = ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb row-major path executes (K=0 quick exit)', function t() {
	var out = ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 5, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});
