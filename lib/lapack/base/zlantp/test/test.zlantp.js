/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantp from './../lib/zlantp.js';


// TESTS //

test( 'zlantp is a function', function t() {
	assert.strictEqual( typeof zlantp, 'function', 'is a function' );
});

test( 'zlantp has expected arity', function t() {
	assert.strictEqual( zlantp.length, 6, 'has expected arity' );
});

test( 'zlantp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlantp( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlantp( 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlantp( 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlantp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlantp( 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
