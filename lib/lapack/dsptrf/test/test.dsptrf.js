/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from './../lib/dsptrf.js';


// TESTS //

test( 'dsptrf is a function', function t() {
	assert.strictEqual( typeof dsptrf, 'function', 'is a function' );
});

test( 'dsptrf has expected arity', function t() {
	assert.strictEqual( dsptrf.length, 6, 'has expected arity' );
});

test( 'dsptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptrf( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dsptrf throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Float64Array( [ 4.0, 1.0, 5.0, 2.0, 3.0, 6.0 ] );
	const IPIV = new Int32Array( 3 );
	const orig = new Float64Array( AP );
	assert.throws( function throws() {
		dsptrf( 'row-major', 'upper', 3, AP, IPIV, 1 );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( AP, orig, 'AP unchanged' );
	assert.deepStrictEqual( IPIV, new Int32Array( 3 ), 'IPIV unchanged' );
});
