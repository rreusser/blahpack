/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfx from './../lib/dlarfx.js';


// TESTS //

test( 'dlarfx is a function', function t() {
	assert.strictEqual( typeof dlarfx, 'function', 'is a function' );
});

test( 'dlarfx has expected arity', function t() {
	assert.strictEqual( dlarfx.length, 10, 'has expected arity' );
});

test( 'dlarfx throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarfx( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlarfx throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarfx( 'column-major', 'left', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlarfx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfx( 'column-major', 'left', new Float64Array( 4 ), -1, 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
