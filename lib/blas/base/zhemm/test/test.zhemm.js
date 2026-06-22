/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhemm from './../lib/zhemm.js';


// TESTS //

test( 'zhemm is a function', function t() {
	assert.strictEqual( typeof zhemm, 'function', 'is a function' );
});

test( 'zhemm has expected arity', function t() {
	assert.strictEqual( zhemm.length, 13, 'has expected arity' );
});

test( 'zhemm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhemm( 'invalid', 'left', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhemm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zhemm( 'row-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhemm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhemm( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhemm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zhemm( 'row-major', 'left', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zhemm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhemm( 'row-major', 'left', 'upper', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
