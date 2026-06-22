/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpgv from './../lib/zhpgv.js';


// TESTS //

test( 'zhpgv is a function', function t() {
	assert.strictEqual( typeof zhpgv, 'function', 'is a function' );
});

test( 'zhpgv has expected arity', function t() {
	assert.strictEqual( zhpgv.length, 12, 'has expected arity' );
});

test( 'zhpgv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpgv( 'invalid', 2, 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpgv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpgv( 'row-major', 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpgv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpgv( 'row-major', 2, 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
