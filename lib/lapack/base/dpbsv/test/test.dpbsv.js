/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbsv from './../lib/dpbsv.js';


// TESTS //

test( 'dpbsv is a function', function t() {
	assert.strictEqual( typeof dpbsv, 'function', 'is a function' );
});

test( 'dpbsv has expected arity', function t() {
	assert.strictEqual( dpbsv.length, 9, 'has expected arity' );
});

test( 'dpbsv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpbsv( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbsv( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpbsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbsv( 'row-major', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dpbsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpbsv( 'row-major', 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
