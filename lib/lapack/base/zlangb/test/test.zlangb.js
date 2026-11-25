/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlangb from './../lib/zlangb.js';


// TESTS //

test( 'zlangb is a function', function t() {
	assert.strictEqual( typeof zlangb, 'function', 'is a function' );
});

test( 'zlangb has expected arity', function t() {
	assert.strictEqual( zlangb.length, 8, 'has expected arity' );
});

test( 'zlangb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlangb( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlangb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlangb( 'column-major', 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlangb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is KL+KU+1 by N band storage (ZLANGB: LDAB >= KL+KU+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return zlangb( order, 'max', 5, 1, 1, Z(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 3 } );
	}, 'column-major LDAB = 3 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 2 } );
	}, RangeError, 'column-major LDAB = 2 is rejected' );
});
