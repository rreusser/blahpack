/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpttf from './../lib/ztpttf.js';


// TESTS //

test( 'ztpttf is a function', function t() {
	assert.strictEqual( typeof ztpttf, 'function', 'is a function' );
});

test( 'ztpttf has expected arity', function t() {
	assert.strictEqual( ztpttf.length, 5, 'has expected arity' );
});

test( 'ztpttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpttf( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpttf( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
