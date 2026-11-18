/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dppcon from './../lib/dppcon.js';


// TESTS //

test( 'dppcon is a function', function t() {
	assert.strictEqual( typeof dppcon, 'function', 'is a function' );
});

test( 'dppcon has expected arity', function t() {
	assert.strictEqual( dppcon.length, 8, 'has expected arity' );
});

test( 'dppcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dppcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dppcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dppcon( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
