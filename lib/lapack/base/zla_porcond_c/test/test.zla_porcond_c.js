
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_porcond_c from './../lib/zla_porcond_c.js';


// TESTS //

test( 'zla_porcond_c is a function', function t() {
	assert.strictEqual( typeof zla_porcond_c, 'function', 'is a function' );
});

test( 'zla_porcond_c has expected arity', function t() {
	assert.strictEqual( zla_porcond_c.length, 14, 'has expected arity' );
});

test( 'zla_porcond_c throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_porcond_c( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_porcond_c throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_porcond_c( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_porcond_c throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_porcond_c( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
