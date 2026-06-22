/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgvx from './../lib/dsbgvx.js';


// TESTS //

test( 'dsbgvx is a function', function t() {
	assert.strictEqual( typeof dsbgvx, 'function', 'is a function' );
});

test( 'dsbgvx has expected arity', function t() {
	assert.strictEqual( dsbgvx.length, 28, 'has expected arity' );
});

test( 'dsbgvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbgvx( 2, 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsbgvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbgvx( 2, 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
