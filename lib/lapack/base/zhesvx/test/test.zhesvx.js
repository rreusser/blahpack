/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhesvx from './../lib/zhesvx.js';


// TESTS //

test( 'zhesvx is a function', function t() {
	assert.strictEqual( typeof zhesvx, 'function', 'is a function' );
});

test( 'zhesvx has expected arity', function t() {
	assert.strictEqual( zhesvx.length, 22, 'has expected arity' );
});

test( 'zhesvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhesvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhesvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhesvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
