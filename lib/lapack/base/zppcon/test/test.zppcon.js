/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zppcon from './../lib/zppcon.js';


// TESTS //

test( 'zppcon is a function', function t() {
	assert.strictEqual( typeof zppcon, 'function', 'is a function' );
});

test( 'zppcon has expected arity', function t() {
	assert.strictEqual( zppcon.length, 7, 'has expected arity' );
});

test( 'zppcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zppcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zppcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zppcon( 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
