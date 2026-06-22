/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspcon from './../lib/dspcon.js';


// TESTS //

test( 'dspcon is a function', function t() {
	assert.strictEqual( typeof dspcon, 'function', 'is a function' );
});

test( 'dspcon has expected arity', function t() {
	assert.strictEqual( dspcon.length, 8, 'has expected arity' );
});

test( 'dspcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspcon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspcon( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
