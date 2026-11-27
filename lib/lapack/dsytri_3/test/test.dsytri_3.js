/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytri3 from './../lib/dsytri_3.js';


// TESTS //

test( 'dsytri3 is a function', function t() {
	assert.strictEqual( typeof dsytri3, 'function', 'is a function' );
});

test( 'dsytri3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri3( 'invalid', 'lower', 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, new Float64Array( 12 ) );
	}, TypeError );
});

test( 'dsytri3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri3( 'column-major', 'invalid', 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, new Float64Array( 12 ) );
	}, TypeError );
});

test( 'dsytri3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri3( 'column-major', 'lower', -1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dsytri3 allocates the reference\'s workspace (N+NB+1)*(NB+3) when WORK is null', function t() {
	const A = new Float64Array( [ 2.0, 0.0, 0.0, 4.0 ] );
	const info = dsytri3( 'column-major', 'lower', 2, A, 2, new Float64Array( 2 ), 1, new Int32Array( [ 0, 1 ] ), 1, null );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( A[ 0 ], 0.5, 'A(0,0)' );
	assert.strictEqual( A[ 3 ], 0.25, 'A(1,1)' );
});
