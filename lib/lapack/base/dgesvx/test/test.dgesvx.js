/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgesvx from './../lib/dgesvx.js';


// TESTS //

test( 'dgesvx is a function', function t() {
	assert.strictEqual( typeof dgesvx, 'function', 'is a function' );
});

test( 'dgesvx has expected arity', function t() {
	assert.strictEqual( dgesvx.length, 25, 'has expected arity' );
});

test( 'dgesvx throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgesvx( 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgesvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgesvx( 2, 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgesvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgesvx( 2, 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
