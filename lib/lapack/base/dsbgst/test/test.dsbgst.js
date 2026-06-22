/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgst from './../lib/dsbgst.js';


// TESTS //

test( 'dsbgst is a function', function t() {
	assert.strictEqual( typeof dsbgst, 'function', 'is a function' );
});

test( 'dsbgst has expected arity', function t() {
	assert.strictEqual( dsbgst.length, 12, 'has expected arity' );
});

test( 'dsbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbgst( 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbgst( 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
