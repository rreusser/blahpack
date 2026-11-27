/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dppsv from './../lib/dppsv.js';


// TESTS //

test( 'dppsv is a function', function t() {
	assert.strictEqual( typeof dppsv, 'function', 'is a function' );
});

test( 'dppsv has expected arity', function t() {
	assert.strictEqual( dppsv.length, 7, 'has expected arity' );
});

test( 'dppsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dppsv( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dppsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dppsv( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dppsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dppsv( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
