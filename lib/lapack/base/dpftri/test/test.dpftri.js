/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftri from './../lib/dpftri.js';


// TESTS //

test( 'dpftri is a function', function t() {
	assert.strictEqual( typeof dpftri, 'function', 'is a function' );
});

test( 'dpftri has expected arity', function t() {
	assert.strictEqual( dpftri.length, 4, 'has expected arity' );
});

test( 'dpftri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpftri( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpftri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpftri( 2, 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
