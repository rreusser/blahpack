/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantb from './../lib/dlantb.js';


// TESTS //

test( 'dlantb is a function', function t() {
	assert.strictEqual( typeof dlantb, 'function', 'is a function' );
});

test( 'dlantb has expected arity', function t() {
	assert.strictEqual( dlantb.length, 8, 'has expected arity' );
});

test( 'dlantb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlantb( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlantb( 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dlantb( 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlantb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlantb( 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlantb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlantb( 'max', 'upper', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
