/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpprfs from './../lib/dpprfs.js';


// TESTS //

test( 'dpprfs is a function', function t() {
	assert.strictEqual( typeof dpprfs, 'function', 'is a function' );
});

test( 'dpprfs has expected arity', function t() {
	assert.strictEqual( dpprfs.length, 13, 'has expected arity' );
});

test( 'dpprfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpprfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpprfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpprfs( 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dpprfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpprfs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
