/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungtr from './../lib/zungtr.js';


// TESTS //

test( 'zungtr is a function', function t() {
	assert.strictEqual( typeof zungtr, 'function', 'is a function' );
});

test( 'zungtr has expected arity', function t() {
	assert.strictEqual( zungtr.length, 8, 'has expected arity' );
});

test( 'zungtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zungtr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zungtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungtr( 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
