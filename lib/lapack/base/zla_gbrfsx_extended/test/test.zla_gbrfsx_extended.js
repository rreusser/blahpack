
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_gbrfsx_extended from './../lib/zla_gbrfsx_extended.js';


// TESTS //

test( 'zla_gbrfsx_extended is a function', function t() {
	assert.strictEqual( typeof zla_gbrfsx_extended, 'function', 'is a function' );
});

test( 'zla_gbrfsx_extended has expected arity', function t() {
	assert.strictEqual( zla_gbrfsx_extended.length, 41, 'has expected arity' );
});

test( 'zla_gbrfsx_extended throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'invalid', 1, 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, TypeError );
});

test( 'zla_gbrfsx_extended throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'column-major', 1, 'bogus', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, TypeError );
});

test( 'zla_gbrfsx_extended throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gbrfsx_extended( 'column-major', 1, 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 1, 10, 0.5, 0.25, false );
	}, RangeError );
});
