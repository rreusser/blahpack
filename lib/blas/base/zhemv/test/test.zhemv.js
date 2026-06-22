/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhemv from './../lib/zhemv.js';


// TESTS //

test( 'zhemv is a function', function t() {
	assert.strictEqual( typeof zhemv, 'function', 'is a function' );
});

test( 'zhemv has expected arity', function t() {
	assert.strictEqual( zhemv.length, 11, 'has expected arity' );
});

test( 'zhemv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhemv( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhemv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhemv( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhemv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhemv( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
