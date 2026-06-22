/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpprfs from './../lib/zpprfs.js';


// TESTS //

test( 'zpprfs is a function', function t() {
	assert.strictEqual( typeof zpprfs, 'function', 'is a function' );
});

test( 'zpprfs has expected arity', function t() {
	assert.strictEqual( zpprfs.length, 13, 'has expected arity' );
});

test( 'zpprfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpprfs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpprfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpprfs( 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zpprfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpprfs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
