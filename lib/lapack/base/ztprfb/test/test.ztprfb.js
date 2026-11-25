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
import Float64Array from '@stdlib/array/float64/lib/index.js';
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
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'invalid', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid side', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'invalid', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid trans', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'invalid', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws RangeError for negative M', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', -1, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative N', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, -1, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative K', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, -1, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
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

test( 'ztprfb column-major path executes (K=0 quick exit)', function t() {
	const out = ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb row-major path executes (K=0 quick exit)', function t() {
	const out = ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 5, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});

test( 'ztprfb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K (ZTPRFB: LDT >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16, 'LDA': 16, 'LDB': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return ztprfb( order, 'left', 'no-transpose', 'forward', 'columnwise', 6, 5, 2, 0, Z(), L.LDV, Z(), L.LDT, Z(), L.LDA, Z(), L.LDB, Z(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
});
