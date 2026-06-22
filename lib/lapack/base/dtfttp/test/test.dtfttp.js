/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfttp from './../lib/dtfttp.js';


// TESTS //

test( 'dtfttp is a function', function t() {
	assert.strictEqual( typeof dtfttp, 'function', 'is a function' );
});

test( 'dtfttp has expected arity', function t() {
	assert.strictEqual( dtfttp.length, 5, 'has expected arity' );
});

test( 'dtfttp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtfttp( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtfttp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtfttp( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
