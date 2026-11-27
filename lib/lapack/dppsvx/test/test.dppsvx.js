/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dppsvx from './../lib/dppsvx.js';


// TESTS //

test( 'dppsvx is a function', function t() {
	assert.strictEqual( typeof dppsvx, 'function', 'is a function' );
});

test( 'dppsvx has expected arity', function t() {
	assert.strictEqual( dppsvx.length, 21, 'has expected arity' );
});

test( 'dppsvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dppsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dppsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dppsvx( 'column-major', 'equilibrate', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dppsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dppsvx( 'column-major', 'equilibrate', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
