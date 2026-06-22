/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztfttp from './../lib/ztfttp.js';


// TESTS //

test( 'ztfttp is a function', function t() {
	assert.strictEqual( typeof ztfttp, 'function', 'is a function' );
});

test( 'ztfttp has expected arity', function t() {
	assert.strictEqual( ztfttp.length, 5, 'has expected arity' );
});

test( 'ztfttp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztfttp( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztfttp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztfttp( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
