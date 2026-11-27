/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbrpvgrw from './../lib/dla_gbrpvgrw.js';


// TESTS //

test( 'dla_gbrpvgrw is a function', function t() {
	assert.strictEqual( typeof dla_gbrpvgrw, 'function', 'is a function' );
});

test( 'dla_gbrpvgrw has expected arity', function t() {
	assert.strictEqual( dla_gbrpvgrw.length, 9, 'has expected arity' );
});

test( 'dla_gbrpvgrw throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_gbrpvgrw( 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dla_gbrpvgrw throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_gbrpvgrw( 'row-major', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dla_gbrpvgrw: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is KL+KU+1 by N and AFB is 2*KL+KU+1 by N band storage (DLA_GBRPVGRW).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16, 'LDAFB': 16 };
		Object.assign( L, ld );
		return dla_gbrpvgrw( order, 5, 1, 1, 5, F(), L.LDAB, F(), L.LDAFB );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 3 } );
	}, 'column-major LDAB = 3 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 2 } );
	}, RangeError, 'column-major LDAB = 2 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAFB': 4 } );
	}, 'column-major LDAFB = 4 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAFB': 3 } );
	}, RangeError, 'column-major LDAFB = 3 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDAB': 5 } );
	}, 'row-major LDAB = 5 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDAB': 4 } );
	}, RangeError, 'row-major LDAB = 4 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDAFB': 5 } );
	}, 'row-major LDAFB = 5 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDAFB': 4 } );
	}, RangeError, 'row-major LDAFB = 4 is rejected' );
});
