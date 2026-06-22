/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zptrfs from './../lib/zptrfs.js';


// TESTS //

test( 'zptrfs is a function', function t() {
	assert.strictEqual( typeof zptrfs, 'function', 'is a function' );
});

test( 'zptrfs has expected arity', function t() {
	assert.strictEqual( zptrfs.length, 23, 'has expected arity' );
});

test( 'zptrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zptrfs( 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zptrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zptrfs( 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zptrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zptrfs( 'upper', new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
