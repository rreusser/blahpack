
/* eslint-disable no-restricted-syntax, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_gbrfsx_extended from './../lib/zla_gbrfsx_extended.js';


// TESTS //

test( 'zla_gbrfsx_extended is a function', function t() {
	assert.strictEqual( typeof zla_gbrfsx_extended, 'function', 'is a function' );
});

test( 'zla_gbrfsx_extended has expected arity', function t() {
	assert.strictEqual( zla_gbrfsx_extended.length, 40, 'has expected arity' );
});

test( 'zla_gbrfsx_extended throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'invalid', 1, 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, TypeError );
});

test( 'zla_gbrfsx_extended throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'column-major', 1, 'bogus', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, TypeError );
});

test( 'zla_gbrfsx_extended throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'column-major', 1, 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, RangeError );
});

test( 'zla_gbrfsx_extended: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// B and Y are N by NRHS (ZLA_GBRFSX_EXTENDED: LDB, LDY >= max(1,N)).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function I() {
		return new Int32Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDAB': 16, 'LDAFB': 16, 'LDB': 16, 'LDY': 16, 'LDERR_BNDS_NORM': 16, 'LDERR_BNDS_COMP': 16 };
		Object.assign( L, ld );
		return zla_gbrfsx_extended( order, 2, 'no-transpose', 6, 1, 1, 2, Z(), L.LDAB, Z(), L.LDAFB, I(), 1, false, F(), 1, Z(), L.LDB, Z(), L.LDY, F(), 1, 2, F(), L.LDERR_BNDS_NORM, F(), L.LDERR_BNDS_COMP, Z(), 1, F(), 1, Z(), 1, Z(), 1, 1e-2, 10, 0.5, 0.25, false );
	}
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDB': 2 } );
	}, 'row-major LDB = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDB': 1 } );
	}, RangeError, 'row-major LDB = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDY': 2 } );
	}, 'row-major LDY = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDY': 1 } );
	}, RangeError, 'row-major LDY = 1 is rejected' );
});
