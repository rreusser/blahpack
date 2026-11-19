/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrttp from './../lib/dtrttp.js';


// TESTS //

test( 'dtrttp is a function', function t() {
	assert.strictEqual( typeof dtrttp, 'function', 'is a function' );
});

test( 'dtrttp has expected arity', function t() {
	assert.strictEqual( dtrttp.length, 6, 'has expected arity' );
});

test( 'dtrttp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrttp( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrttp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrttp( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrttp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrttp( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
