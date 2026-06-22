/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsp from './../lib/dlaqsp.js';


// TESTS //

test( 'dlaqsp is a function', function t() {
	assert.strictEqual( typeof dlaqsp, 'function', 'is a function' );
});

test( 'dlaqsp has expected arity', function t() {
	assert.strictEqual( dlaqsp.length, 7, 'has expected arity' );
});

test( 'dlaqsp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlaqsp( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2 );
	}, TypeError );
});

test( 'dlaqsp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqsp( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2 );
	}, RangeError );
});
