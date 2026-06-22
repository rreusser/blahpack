/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zheevx from './../lib/zheevx.js';


// TESTS //

test( 'zheevx is a function', function t() {
	assert.strictEqual( typeof zheevx, 'function', 'is a function' );
});

test( 'zheevx has expected arity', function t() {
	assert.strictEqual( zheevx.length, 25, 'has expected arity' );
});

test( 'zheevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheevx( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zheevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheevx( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
