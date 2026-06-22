/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetf2 from './../lib/zhetf2.js';


// TESTS //

test( 'zhetf2 is a function', function t() {
	assert.strictEqual( typeof zhetf2, 'function', 'is a function' );
});

test( 'zhetf2 has expected arity', function t() {
	assert.strictEqual( zhetf2.length, 6, 'has expected arity' );
});

test( 'zhetf2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetf2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhetf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetf2( 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
