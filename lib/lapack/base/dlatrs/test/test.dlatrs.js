/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrs from './../lib/dlatrs.js';


// TESTS //

test( 'dlatrs is a function', function t() {
	assert.strictEqual( typeof dlatrs, 'function', 'is a function' );
});

test( 'dlatrs has expected arity', function t() {
	assert.strictEqual( dlatrs.length, 13, 'has expected arity' );
});

test( 'dlatrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlatrs( 'invalid', 'upper', 'no-transpose', 'non-unit', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatrs( 'row-major', 'invalid', 'no-transpose', 'non-unit', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlatrs( 'row-major', 'upper', 'invalid', 'non-unit', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatrs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlatrs( 'row-major', 'upper', 'no-transpose', 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlatrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatrs( 'row-major', 'upper', 'no-transpose', 'non-unit', 2, -1, new Float64Array( 4 ), 2, 2, 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
