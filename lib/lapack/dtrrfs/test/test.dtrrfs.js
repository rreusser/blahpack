/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrrfs from './../lib/dtrrfs.js';


// TESTS //

test( 'dtrrfs is a function', function t() {
	assert.strictEqual( typeof dtrrfs, 'function', 'is a function' );
});

test( 'dtrrfs has expected arity', function t() {
	assert.strictEqual( dtrrfs.length, 18, 'has expected arity' );
});

test( 'dtrrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrrfs( 'column-major', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtrrfs( 'column-major', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrrfs throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtrrfs( 'column-major', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtrrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dtrrfs( 'column-major', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
