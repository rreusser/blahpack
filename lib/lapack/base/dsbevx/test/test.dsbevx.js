/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbevx from './../lib/dsbevx.js';


// TESTS //

test( 'dsbevx is a function', function t() {
	assert.strictEqual( typeof dsbevx, 'function', 'is a function' );
});

test( 'dsbevx has expected arity', function t() {
	assert.strictEqual( dsbevx.length, 25, 'has expected arity' );
});

test( 'dsbevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbevx( 2, 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsbevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbevx( 2, 2, 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
