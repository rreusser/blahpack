/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatps from './../lib/dlatps.js';


// TESTS //

test( 'dlatps is a function', function t() {
	assert.strictEqual( typeof dlatps, 'function', 'is a function' );
});

test( 'dlatps has expected arity', function t() {
	assert.strictEqual( dlatps.length, 11, 'has expected arity' );
});

test( 'dlatps throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatps( 'invalid', 'no-transpose', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'invalid', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'no-transpose', 'invalid', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'no-transpose', 'non-unit', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatps( 'upper', 'no-transpose', 'non-unit', 'N', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
