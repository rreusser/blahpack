/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqhb from './../lib/zlaqhb.js';


// TESTS //

test( 'zlaqhb is a function', function t() {
	assert.strictEqual( typeof zlaqhb, 'function', 'is a function' );
});

test( 'zlaqhb has expected arity', function t() {
	assert.strictEqual( zlaqhb.length, 11, 'has expected arity' );
});

test( 'zlaqhb throws TypeError for an invalid order', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhb( 'foo', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhb throws TypeError for an invalid uplo', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhb( 'column-major', 'invalid', 2, 1, AB, 2, S, 1, 1, 1, equed );
	}, TypeError );
});

test( 'zlaqhb throws RangeError for negative N', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	assert.throws( function throws() {
		zlaqhb( 'column-major', 'upper', -1, 1, AB, 2, S, 1, 1, 1, equed );
	}, RangeError );
});

test( 'zlaqhb returns the scale factor array and writes \'none\' to equed when no scaling is needed', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 1, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'none', 'equed' );
});

test( 'zlaqhb writes \'yes\' to equed when scaling is applied', function t() {
	const AB = new Complex128Array( 4 );
	const S = new Float64Array( [ 0.5, 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhb( 'column-major', 'upper', 2, 1, AB, 2, S, 1, 0.01, 1, equed );
	assert.strictEqual( out, AB, 'returns expected array' );
	assert.strictEqual( equed[ 0 ], 'yes', 'equed' );
});

test( 'zlaqhb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is KD+1 by N band storage (ZLAQHB: LDAB >= KD+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return zlaqhb( order, 'upper', 5, 1, Z(), L.LDAB, F(), 1, 1.0, 1.0, [ '' ] );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
