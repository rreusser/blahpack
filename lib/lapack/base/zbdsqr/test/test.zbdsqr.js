/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zbdsqr from './../lib/zbdsqr.js';


// TESTS //

test( 'zbdsqr is a function', function t() {
	assert.strictEqual( typeof zbdsqr, 'function', 'is a function' );
});

test( 'zbdsqr has expected arity', function t() {
	assert.strictEqual( zbdsqr.length, 18, 'has expected arity' );
});

test( 'zbdsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zbdsqr( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zbdsqr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zbdsqr( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zbdsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zbdsqr( 'row-major', 'upper', -1, 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
