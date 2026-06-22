/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyrfs from './../lib/dsyrfs.js';


// TESTS //

test( 'dsyrfs is a function', function t() {
	assert.strictEqual( typeof dsyrfs, 'function', 'is a function' );
});

test( 'dsyrfs has expected arity', function t() {
	assert.strictEqual( dsyrfs.length, 21, 'has expected arity' );
});

test( 'dsyrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyrfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsyrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyrfs( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dsyrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsyrfs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
