/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarfx from './../lib/zlarfx.js';


// TESTS //

test( 'zlarfx is a function', function t() {
	assert.strictEqual( typeof zlarfx, 'function', 'is a function' );
});

test( 'zlarfx has expected arity', function t() {
	assert.strictEqual( zlarfx.length, 10, 'has expected arity' );
});

test( 'zlarfx throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlarfx( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlarfx throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarfx( 'left', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlarfx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarfx( 'left', new Float64Array( 4 ), -1, 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
