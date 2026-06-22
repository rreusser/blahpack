/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlasr from './../lib/zlasr.js';


// TESTS //

test( 'zlasr is a function', function t() {
	assert.strictEqual( typeof zlasr, 'function', 'is a function' );
});

test( 'zlasr has expected arity', function t() {
	assert.strictEqual( zlasr.length, 12, 'has expected arity' );
});

test( 'zlasr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlasr( 'invalid', 'left', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlasr( 'row-major', 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlasr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlasr( 'row-major', 'left', 2, 2, -1, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlasr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlasr( 'row-major', 'left', 2, 2, new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
