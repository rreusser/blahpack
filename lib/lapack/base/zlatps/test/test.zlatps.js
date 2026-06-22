/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatps from './../lib/zlatps.js';


// TESTS //

test( 'zlatps is a function', function t() {
	assert.strictEqual( typeof zlatps, 'function', 'is a function' );
});

test( 'zlatps has expected arity', function t() {
	assert.strictEqual( zlatps.length, 9, 'has expected arity' );
});

test( 'zlatps throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatps( 'invalid', 'no-transpose', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'invalid', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'no-transpose', 'invalid', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'no-transpose', 'non-unit', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlatps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatps( 'upper', 'no-transpose', 'non-unit', 'N', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});
