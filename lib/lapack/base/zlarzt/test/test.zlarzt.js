/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarzt from './../lib/zlarzt.js';


// TESTS //

test( 'zlarzt is a function', function t() {
	assert.strictEqual( typeof zlarzt, 'function', 'is a function' );
});

test( 'zlarzt has expected arity', function t() {
	assert.strictEqual( zlarzt.length, 11, 'has expected arity' );
});

test( 'zlarzt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarzt( 'invalid', 'no-transpose', 'no-transpose', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarzt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarzt( 'row-major', 'backward', 'rowwise', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarzt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarzt( 'row-major', 'backward', 'rowwise', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarzt: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K (ZLARZT: LDT >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16 };
		Object.assign( L, ld );
		return zlarzt( order, 'backward', 'rowwise', 5, 2, Z(), L.LDV, Z(), 1, Z(), L.LDT );
	}
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
});
