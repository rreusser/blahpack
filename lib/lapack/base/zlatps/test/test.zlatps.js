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
	assert.strictEqual( zlatps.length, 12, 'has expected arity' );
});

test( 'zlatps throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'invalid', 'no-transpose', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'invalid', 'non-unit', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'invalid', 'N', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws TypeError for invalid normin', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlatps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatps( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
