/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsb from './../lib/dlaqsb.js';


// TESTS //

test( 'dlaqsb is a function', function t() {
	assert.strictEqual( typeof dlaqsb, 'function', 'is a function' );
});

test( 'dlaqsb has expected arity', function t() {
	assert.strictEqual( dlaqsb.length, 11, 'has expected arity' );
});

test( 'dlaqsb throws TypeError for an invalid order', function t() {
	const AB = new Float64Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsb( 'foo', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsb throws TypeError for an invalid uplo', function t() {
	const AB = new Float64Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsb( 'column-major', 'invalid', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'dlaqsb throws RangeError for negative N', function t() {
	const AB = new Float64Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		dlaqsb( 'column-major', 'upper', -1, 1, AB, 2, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'dlaqsb returns the input array and writes \'none\' to equed when no scaling is needed', function t() {
	const AB = new Float64Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'dlaqsb writes \'yes\' to equed when scaling is applied', function t() {
	const AB = new Float64Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = dlaqsb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});

test( 'dlaqsb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is KD+1 by N band storage (DLAQSB: LDAB >= KD+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return dlaqsb( order, 'upper', 5, 1, F(), L.LDAB, F(), 1, 1.0, 1.0, [ '' ] );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
