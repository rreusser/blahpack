/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztftri from './../lib/ztftri.js';


// TESTS //

test( 'ztftri is a function', function t() {
	assert.strictEqual( typeof ztftri, 'function', 'is a function' );
});

test( 'ztftri has expected arity', function t() {
	assert.strictEqual( ztftri.length, 5, 'has expected arity' );
});

test( 'ztftri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztftri( 2, 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztftri throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztftri( 2, 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztftri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztftri( 2, 'upper', 'non-unit', -1, new Float64Array( 4 ) );
	}, RangeError );
});
