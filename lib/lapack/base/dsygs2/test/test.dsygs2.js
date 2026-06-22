/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygs2 from './../lib/dsygs2.js';


// TESTS //

test( 'dsygs2 is a function', function t() {
	assert.strictEqual( typeof dsygs2, 'function', 'is a function' );
});

test( 'dsygs2 has expected arity', function t() {
	assert.strictEqual( dsygs2.length, 7, 'has expected arity' );
});

test( 'dsygs2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsygs2( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsygs2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsygs2( 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
