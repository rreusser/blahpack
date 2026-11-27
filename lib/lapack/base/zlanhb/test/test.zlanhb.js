/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhb from './../lib/zlanhb.js';


// TESTS //

test( 'zlanhb is a function', function t() {
	assert.strictEqual( typeof zlanhb, 'function', 'is a function' );
});

test( 'zlanhb has expected arity', function t() {
	assert.strictEqual( zlanhb.length, 8, 'has expected arity' );
});

test( 'zlanhb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhb( 'column-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlanhb( 'column-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhb( 'column-major', 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlanhb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlanhb( 'column-major', 'max', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlanhb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is K+1 by N band storage (ZLANHB: LDAB >= K+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return zlanhb( order, 'max', 'upper', 5, 1, Z(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
