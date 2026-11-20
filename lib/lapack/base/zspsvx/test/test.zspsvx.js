/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zspsvx from './../lib/zspsvx.js';


// TESTS //

test( 'zspsvx is a function', function t() {
	assert.strictEqual( typeof zspsvx, 'function', 'is a function' );
});

test( 'zspsvx has expected arity', function t() {
	assert.strictEqual( zspsvx.length, 20, 'has expected arity' );
});

test( 'zspsvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zspsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspsvx( 'column-major', 'factored', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zspsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zspsvx( 'column-major', 'factored', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
