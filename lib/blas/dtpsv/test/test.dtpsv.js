/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpsv from './../lib/dtpsv.js';


// TESTS //

test( 'dtpsv is a function', function t() {
	assert.strictEqual( typeof dtpsv, 'function', 'is a function' );
});

test( 'dtpsv has expected arity', function t() {
	assert.strictEqual( dtpsv.length, 8, 'has expected arity' );
});

test( 'dtpsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpsv( 'column-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtpsv( 'column-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtpsv( 'column-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1 );
	}, TypeError );
});

test( 'dtpsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpsv( 'column-major', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, 1 );
	}, RangeError );
});

test( 'dtpsv throws TypeError for row-major order (packed storage is column-major)', function t() {
	assert.throws( function throws() {
		dtpsv( 'row-major', 'upper', 'no-transpose', 'non-unit', 2, new Float64Array( 3 ), new Float64Array( 2 ), 1 );
	}, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
});
