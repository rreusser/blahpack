/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpcon from './../lib/zhpcon.js';


// TESTS //

test( 'zhpcon is a function', function t() {
	assert.strictEqual( typeof zhpcon, 'function', 'is a function' );
});

test( 'zhpcon has expected arity', function t() {
	assert.strictEqual( zhpcon.length, 9, 'has expected arity' );
});

test( 'zhpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpcon( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
