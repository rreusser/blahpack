/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansp from './../lib/zlansp.js';


// TESTS //

test( 'zlansp is a function', function t() {
	assert.strictEqual( typeof zlansp, 'function', 'is a function' );
});

test( 'zlansp has expected arity', function t() {
	assert.strictEqual( zlansp.length, 5, 'has expected arity' );
});

test( 'zlansp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlansp( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlansp( 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlansp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlansp( 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
