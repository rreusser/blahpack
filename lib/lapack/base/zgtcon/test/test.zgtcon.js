/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgtcon from './../lib/zgtcon.js';


// TESTS //

test( 'zgtcon is a function', function t() {
	assert.strictEqual( typeof zgtcon, 'function', 'is a function' );
});

test( 'zgtcon has expected arity', function t() {
	assert.strictEqual( zgtcon.length, 16, 'has expected arity' );
});

test( 'zgtcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zgtcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgtcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgtcon( 'one-norm', -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
