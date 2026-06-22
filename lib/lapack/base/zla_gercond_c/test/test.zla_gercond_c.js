
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_gercond_c from './../lib/zla_gercond_c.js';


// TESTS //

test( 'zla_gercond_c is a function', function t() {
	assert.strictEqual( typeof zla_gercond_c, 'function', 'is a function' );
});

test( 'zla_gercond_c has expected arity', function t() {
	assert.strictEqual( zla_gercond_c.length, 17, 'has expected arity' );
});

test( 'zla_gercond_c throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_gercond_c( 'invalid', 'no-transpose', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_gercond_c throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zla_gercond_c( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_gercond_c throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_gercond_c( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
