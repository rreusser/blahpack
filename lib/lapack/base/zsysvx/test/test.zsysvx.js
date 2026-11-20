/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsysvx from './../lib/zsysvx.js';


// TESTS //

test( 'zsysvx is a function', function t() {
	assert.strictEqual( typeof zsysvx, 'function', 'is a function' );
});

test( 'zsysvx has expected arity', function t() {
	assert.strictEqual( zsysvx.length, 22, 'has expected arity' );
});

test( 'zsysvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsysvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zsysvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsysvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zsysvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsysvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
