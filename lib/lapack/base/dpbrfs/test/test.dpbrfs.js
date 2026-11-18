/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbrfs from './../lib/dpbrfs.js';


// TESTS //

test( 'dpbrfs is a function', function t() {
	assert.strictEqual( typeof dpbrfs, 'function', 'is a function' );
});

test( 'dpbrfs has expected arity', function t() {
	assert.strictEqual( dpbrfs.length, 19, 'has expected arity' );
});

test( 'dpbrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbrfs( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbrfs( 'column-major', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dpbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpbrfs( 'column-major', 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
