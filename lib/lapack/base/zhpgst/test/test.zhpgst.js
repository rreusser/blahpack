/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpgst from './../lib/zhpgst.js';


// TESTS //

test( 'zhpgst is a function', function t() {
	assert.strictEqual( typeof zhpgst, 'function', 'is a function' );
});

test( 'zhpgst has expected arity', function t() {
	assert.strictEqual( zhpgst.length, 5, 'has expected arity' );
});

test( 'zhpgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpgst( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpgst( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
