/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtprfs from './../lib/dtprfs.js';


// TESTS //

test( 'dtprfs is a function', function t() {
	assert.strictEqual( typeof dtprfs, 'function', 'is a function' );
});

test( 'dtprfs has expected arity', function t() {
	assert.strictEqual( dtprfs.length, 18, 'has expected arity' );
});

test( 'dtprfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtprfs( 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtprfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtprfs( 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtprfs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtprfs( 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtprfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtprfs( 'upper', 'no-transpose', 'non-unit', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dtprfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtprfs( 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
