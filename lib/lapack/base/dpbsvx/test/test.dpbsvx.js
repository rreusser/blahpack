/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbsvx from './../lib/dpbsvx.js';


// TESTS //

test( 'dpbsvx is a function', function t() {
	assert.strictEqual( typeof dpbsvx, 'function', 'is a function' );
});

test( 'dpbsvx has expected arity', function t() {
	assert.strictEqual( dpbsvx.length, 25, 'has expected arity' );
});

test( 'dpbsvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbsvx( 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dpbsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbsvx( 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dpbsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpbsvx( 2, 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
