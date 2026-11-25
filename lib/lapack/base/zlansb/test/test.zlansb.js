/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansb from './../lib/zlansb.js';


// TESTS //

test( 'zlansb is a function', function t() {
	assert.strictEqual( typeof zlansb, 'function', 'is a function' );
});

test( 'zlansb has expected arity', function t() {
	assert.strictEqual( zlansb.length, 8, 'has expected arity' );
});

test( 'zlansb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlansb( 'column-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlansb( 'column-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlansb( 'column-major', 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlansb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlansb( 'column-major', 'max', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlansb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is K+1 by N band storage (ZLANSB: LDAB >= K+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return zlansb( order, 'max', 'upper', 5, 1, Z(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
