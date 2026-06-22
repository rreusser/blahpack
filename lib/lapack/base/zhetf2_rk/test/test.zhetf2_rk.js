/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetf2rk from './../lib/zhetf2_rk.js';


// TESTS //

test( 'zhetf2_rk is a function', function t() {
	assert.strictEqual( typeof zhetf2rk, 'function', 'is a function' );
});

test( 'zhetf2_rk has expected arity', function t() {
	assert.strictEqual( zhetf2rk.length, 10, 'has expected arity' );
});

test( 'zhetf2_rk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetf2rk( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhetf2_rk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetf2rk( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhetf2_rk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetf2rk( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
