/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhecon from './../lib/zhecon.js';


// TESTS //

test( 'zhecon is a function', function t() {
	assert.strictEqual( typeof zhecon, 'function', 'is a function' );
});

test( 'zhecon has expected arity', function t() {
	assert.strictEqual( zhecon.length, 10, 'has expected arity' );
});

test( 'zhecon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhecon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhecon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhecon( 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
