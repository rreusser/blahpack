/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zspcon from './../lib/zspcon.js';


// TESTS //

test( 'zspcon is a function', function t() {
	assert.strictEqual( typeof zspcon, 'function', 'is a function' );
});

test( 'zspcon has expected arity', function t() {
	assert.strictEqual( zspcon.length, 9, 'has expected arity' );
});

test( 'zspcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zspcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspcon( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
