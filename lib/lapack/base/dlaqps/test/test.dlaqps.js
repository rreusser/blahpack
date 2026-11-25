/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqps from './../lib/dlaqps.js';


// TESTS //

test( 'dlaqps is a function', function t() {
	assert.strictEqual( typeof dlaqps, 'function', 'is a function' );
});

test( 'dlaqps has expected arity', function t() {
	assert.strictEqual( dlaqps.length, 20, 'has expected arity' );
});

test( 'dlaqps throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlaqps( 'column-major', -1, new Float64Array( 4 ), 2, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlaqps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlaqps( 'column-major', new Float64Array( 4 ), -1, 2, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlaqps: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// F is N by NB (DLAQPS: LDF >= max(1,N)), not M by NB.
	function F() {
		return new Float64Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDF': 16 };
		Object.assign( L, ld );
		return dlaqps( order, 6, 4, 0, 2, new Int32Array( 1 ), F(), L.LDA, I(), 1, F(), 1, F(), 1, F(), 1, F(), 1, F(), L.LDF );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDF': 4 } );
	}, 'column-major LDF = 4 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDF': 3 } );
	}, RangeError, 'column-major LDF = 3 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDF': 2 } );
	}, 'row-major LDF = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDF': 1 } );
	}, RangeError, 'row-major LDF = 1 is rejected' );
});
