/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dporfs from './../lib/dporfs.js';


// TESTS //

test( 'dporfs is a function', function t() {
	assert.strictEqual( typeof dporfs, 'function', 'is a function' );
});

test( 'dporfs has expected arity', function t() {
	assert.strictEqual( dporfs.length, 15, 'has expected arity' );
});

test( 'dporfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dporfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dporfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dporfs( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dporfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dporfs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
