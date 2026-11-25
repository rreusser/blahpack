/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb_gett from './../lib/dlarfb_gett.js';


// TESTS //

test( 'dlarfb_gett is a function', function t() {
	assert.strictEqual( typeof dlarfb_gett, 'function', 'is a function' );
});

test( 'dlarfb_gett has expected arity', function t() {
	assert.strictEqual( dlarfb_gett.length, 13, 'has expected arity' );
});

test( 'dlarfb_gett throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'invalid', 'not-identity', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfb_gett throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarfb_gett( 'row-major', 'not-identity', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb_gett: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K, A is K by N, WORK is K by max(K,N-K) (DLARFB_GETT).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDT': 16, 'LDA': 16, 'LDB': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return dlarfb_gett( order, 'not-identity', 6, 5, 2, F(), L.LDT, F(), L.LDA, F(), L.LDB, F(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDA': 2 } );
	}, 'column-major LDA = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDA': 1 } );
	}, RangeError, 'column-major LDA = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDWORK': 2 } );
	}, 'column-major LDWORK = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDWORK': 1 } );
	}, RangeError, 'column-major LDWORK = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDWORK': 3 } );
	}, 'row-major LDWORK = 3 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDWORK': 2 } );
	}, RangeError, 'row-major LDWORK = 2 is rejected' );
});
