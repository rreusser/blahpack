/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytri from './../lib/zsytri.js';


// TESTS //

test( 'zsytri is a function', function t() {
	assert.strictEqual( typeof zsytri, 'function', 'is a function' );
});

test( 'zsytri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytri( 'invalid', 2, new Float64Array( 8 ), 2, new Int32Array( 2 ) );
	}, TypeError );
});

test( 'zsytri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytri( 'upper', -1, new Float64Array( 4 ), 2, new Int32Array( 2 ) );
	}, RangeError );
});
