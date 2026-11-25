/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrd from './../lib/dlatrd.js';


// TESTS //

test( 'dlatrd is a function', function t() {
	assert.strictEqual( typeof dlatrd, 'function', 'is a function' );
});

test( 'dlatrd has expected arity', function t() {
	assert.strictEqual( dlatrd.length, 12, 'has expected arity' );
});

test( 'dlatrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlatrd( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlatrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatrd( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlatrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatrd( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlatrd: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// W is N by NB (DLATRD: LDW >= max(1,N)).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDW': 16 };
		Object.assign( L, ld );
		return dlatrd( order, 'upper', 6, 2, F(), L.LDA, F(), 1, F(), 1, F(), L.LDW );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDW': 6 } );
	}, 'column-major LDW = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDW': 5 } );
	}, RangeError, 'column-major LDW = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDW': 2 } );
	}, 'row-major LDW = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDW': 1 } );
	}, RangeError, 'row-major LDW = 1 is rejected' );
});
