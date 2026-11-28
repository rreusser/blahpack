/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlangb from './../lib/dlangb.js';


// TESTS //

test( 'dlangb is a function', function t() {
	assert.strictEqual( typeof dlangb, 'function', 'is a function' );
});

test( 'dlangb has expected arity', function t() {
	assert.strictEqual( dlangb.length, 8, 'has expected arity' );
});

test( 'dlangb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlangb( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlangb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlangb( 'column-major', 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlangb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is KL+KU+1 by N band storage (DLANGB: LDAB >= KL+KU+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return dlangb( order, 'max', 5, 1, 1, F(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 3 } );
	}, 'column-major LDAB = 3 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 2 } );
	}, RangeError, 'column-major LDAB = 2 is rejected' );
});
