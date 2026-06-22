/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr2 from './../lib/dspr2.js';


// TESTS //

test( 'dspr2 is a function', function t() {
	assert.strictEqual( typeof dspr2, 'function', 'is a function' );
});

test( 'dspr2 has expected arity', function t() {
	assert.strictEqual( dspr2.length, 9, 'has expected arity' );
});

test( 'dspr2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspr2( 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dspr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspr2( 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
