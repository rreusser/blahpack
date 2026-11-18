/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsprfs from './../lib/dsprfs.js';


// TESTS //

test( 'dsprfs is a function', function t() {
	assert.strictEqual( typeof dsprfs, 'function', 'is a function' );
});

test( 'dsprfs has expected arity', function t() {
	assert.strictEqual( dsprfs.length, 20, 'has expected arity' );
});

test( 'dsprfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsprfs( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsprfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsprfs( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsprfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsprfs( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
