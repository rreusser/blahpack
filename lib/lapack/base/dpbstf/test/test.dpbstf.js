/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbstf from './../lib/dpbstf.js';


// TESTS //

test( 'dpbstf is a function', function t() {
	assert.strictEqual( typeof dpbstf, 'function', 'is a function' );
});

test( 'dpbstf has expected arity', function t() {
	assert.strictEqual( dpbstf.length, 6, 'has expected arity' );
});

test( 'dpbstf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpbstf( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbstf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbstf( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbstf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbstf( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
