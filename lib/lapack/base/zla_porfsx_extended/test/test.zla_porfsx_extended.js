/* eslint-disable no-restricted-syntax, max-len, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_porfsx_extended from './../lib/zla_porfsx_extended.js';


// FUNCTIONS //

/**
* Build a dummy argument list for invalid-input tests.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle flag
* @param {integer} N - matrix order
* @param {integer} nrhs - number of right-hand sides
* @returns {Array} positional argument list
*/
function dummyArgs( order, uplo, N, nrhs ) {
	const A = new Complex128Array( 4 );
	const c = new Float64Array( 4 );
	const b = new Float64Array( 4 );
	return [
		order,
		2,
		uplo,
		N,
		nrhs,
		A,
		2,
		A,
		2,
		false,
		c,
		1,
		A,
		2,
		A,
		2,
		b,
		1,
		2,
		b,
		2,
		b,
		2,
		A,
		1,
		b,
		1,
		A,
		1,
		A,
		1,
		1.0,
		10,
		0.5,
		0.25,
		false
	];
}


// TESTS //

test( 'zla_porfsx_extended is a function', function t() {
	assert.strictEqual( typeof zla_porfsx_extended, 'function', 'is a function' );
});

test( 'zla_porfsx_extended has expected arity', function t() {
	assert.strictEqual( zla_porfsx_extended.length, 36, 'has expected arity' );
});

test( 'zla_porfsx_extended throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'invalid', 'upper', 2, 1 ) );
	}, TypeError );
});

test( 'zla_porfsx_extended throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'invalid', 2, 1 ) );
	}, TypeError );
});

test( 'zla_porfsx_extended throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'upper', -1, 1 ) );
	}, RangeError );
});

test( 'zla_porfsx_extended throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'upper', 2, -1 ) );
	}, RangeError );
});

test( 'zla_porfsx_extended: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// B and Y are N by NRHS (ZLA_PORFSX_EXTENDED: LDB, LDY >= max(1,N)).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDA': 16, 'LDAF': 16, 'LDB': 16, 'LDY': 16, 'LDERR_BNDS_NORM': 16, 'LDERR_BNDS_COMP': 16 };
		Object.assign( L, ld );
		return zla_porfsx_extended( order, 2, 'upper', 6, 2, Z(), L.LDA, Z(), L.LDAF, false, F(), 1, Z(), L.LDB, Z(), L.LDY, F(), 1, 2, F(), L.LDERR_BNDS_NORM, F(), L.LDERR_BNDS_COMP, Z(), 1, F(), 1, Z(), 1, Z(), 1, 1e-2, 10, 0.5, 0.25, false );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDB': 6 } );
	}, 'column-major LDB = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDB': 5 } );
	}, RangeError, 'column-major LDB = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDB': 2 } );
	}, 'row-major LDB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDB': 1 } );
	}, RangeError, 'row-major LDB = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDY': 6 } );
	}, 'column-major LDY = 6 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDY': 5 } );
	}, RangeError, 'column-major LDY = 5 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDY': 2 } );
	}, 'row-major LDY = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDY': 1 } );
	}, RangeError, 'row-major LDY = 1 is rejected' );
});
