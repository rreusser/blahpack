/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetrf from './../lib/zhetrf.js';


// TESTS //

test( 'zhetrf is a function', function t() {
	assert.strictEqual( typeof zhetrf, 'function', 'is a function' );
});

test( 'zhetrf has expected arity', function t() {
	assert.strictEqual( zhetrf.length, 8, 'has expected arity' );
});

test( 'zhetrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, null );
	}, TypeError );
});

test( 'zhetrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrf( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, null );
	}, RangeError );
});
