/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbrfs from './../lib/dtbrfs.js';


// TESTS //

test( 'dtbrfs is a function', function t() {
	assert.strictEqual( typeof dtbrfs, 'function', 'is a function' );
});

test( 'dtbrfs has expected arity', function t() {
	assert.strictEqual( dtbrfs.length, 19, 'has expected arity' );
});

test( 'dtbrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbrfs( 'column-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtbrfs( 'column-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbrfs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbrfs( 'column-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtbrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
