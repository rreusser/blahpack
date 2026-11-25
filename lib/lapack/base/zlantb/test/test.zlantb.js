/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantb from './../lib/zlantb.js';


// TESTS //

test( 'zlantb is a function', function t() {
	assert.strictEqual( typeof zlantb, 'function', 'is a function' );
});

test( 'zlantb has expected arity', function t() {
	assert.strictEqual( zlantb.length, 9, 'has expected arity' );
});

test( 'zlantb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlantb( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlantb( 'column-major', 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantb throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlantb( 'column-major', 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlantb( 'column-major', 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlantb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlantb( 'column-major', 'max', 'upper', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlantb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is K+1 by N band storage (ZLANTB: LDAB >= K+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return zlantb( order, 'max', 'upper', 'non-unit', 5, 1, Z(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
