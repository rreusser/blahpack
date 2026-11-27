/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantb from './../lib/dlantb.js';


// TESTS //

test( 'dlantb is a function', function t() {
	assert.strictEqual( typeof dlantb, 'function', 'is a function' );
});

test( 'dlantb has expected arity', function t() {
	assert.strictEqual( dlantb.length, 9, 'has expected arity' );
});

test( 'dlantb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlantb( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlantb( 'column-major', 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlantb( 'column-major', 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlantb( 'column-major', 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlantb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlantb( 'column-major', 'max', 'upper', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlantb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// AB is K+1 by N band storage (DLANTB: LDAB >= K+1).
	function F() {
		return new Float64Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16 };
		Object.assign( L, ld );
		return dlantb( order, 'max', 'upper', 'non-unit', 5, 1, F(), L.LDAB, F() );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDAB': 2 } );
	}, 'column-major LDAB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDAB': 1 } );
	}, RangeError, 'column-major LDAB = 1 is rejected' );
});
