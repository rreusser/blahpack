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
	assert.strictEqual( zhetrf.length, 6, 'has expected arity' );
});

test( 'zhetrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhetrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrf( 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
