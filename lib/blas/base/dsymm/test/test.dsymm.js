/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymm from './../lib/dsymm.js';


// TESTS //

test( 'dsymm is a function', function t() {
	assert.strictEqual( typeof dsymm, 'function', 'is a function' );
});

test( 'dsymm has expected arity', function t() {
	assert.strictEqual( dsymm.length, 13, 'has expected arity' );
});

test( 'dsymm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsymm( 'invalid', 'left', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsymm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dsymm( 'row-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsymm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsymm( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsymm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dsymm( 'row-major', 'left', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsymm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsymm( 'row-major', 'left', 'upper', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
