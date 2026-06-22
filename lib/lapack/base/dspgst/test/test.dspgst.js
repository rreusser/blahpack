/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspgst from './../lib/dspgst.js';


// TESTS //

test( 'dspgst is a function', function t() {
	assert.strictEqual( typeof dspgst, 'function', 'is a function' );
});

test( 'dspgst has expected arity', function t() {
	assert.strictEqual( dspgst.length, 5, 'has expected arity' );
});

test( 'dspgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspgst( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspgst( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
