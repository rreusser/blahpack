/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasyf from './../lib/dlasyf.js';


// TESTS //

test( 'dlasyf is a function', function t() {
	assert.strictEqual( typeof dlasyf, 'function', 'is a function' );
});

test( 'dlasyf has expected arity', function t() {
	assert.strictEqual( dlasyf.length, 11, 'has expected arity' );
});

test( 'dlasyf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'invalid', 'upper', new Float64Array( 4 ), 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'row-major', 'invalid', new Float64Array( 4 ), 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'row-major', 'upper', -1, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlasyf: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// W is N by NB (DLASYF: LDW >= max(1,N)).
	function F() {
		return new Float64Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDW': 16 };
		Object.assign( L, ld );
		return dlasyf( order, 'upper', 6, 2, new Int32Array( 1 ), F(), L.LDA, I(), 1, F(), L.LDW );
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
