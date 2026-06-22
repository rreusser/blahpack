
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zla_syrcond_x from './../lib/zla_syrcond_x.js';


// TESTS //

test( 'zla_syrcond_x is a function', function t() {
	assert.strictEqual( typeof zla_syrcond_x, 'function', 'is a function' );
});

test( 'zla_syrcond_x has expected arity', function t() {
	assert.strictEqual( zla_syrcond_x.length, 16, 'has expected arity' );
});

test( 'zla_syrcond_x throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_syrcond_x( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_syrcond_x throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_syrcond_x( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zla_syrcond_x throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_syrcond_x( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
