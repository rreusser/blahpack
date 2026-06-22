/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhbgst from './../lib/zhbgst.js';


// TESTS //

test( 'zhbgst is a function', function t() {
	assert.strictEqual( typeof zhbgst, 'function', 'is a function' );
});

test( 'zhbgst has expected arity', function t() {
	assert.strictEqual( zhbgst.length, 13, 'has expected arity' );
});

test( 'zhbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbgst( 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbgst( 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
