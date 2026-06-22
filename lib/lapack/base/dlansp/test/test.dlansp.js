/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansp from './../lib/dlansp.js';


// TESTS //

test( 'dlansp is a function', function t() {
	assert.strictEqual( typeof dlansp, 'function', 'is a function' );
});

test( 'dlansp has expected arity', function t() {
	assert.strictEqual( dlansp.length, 5, 'has expected arity' );
});

test( 'dlansp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlansp( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlansp( 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlansp( 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
