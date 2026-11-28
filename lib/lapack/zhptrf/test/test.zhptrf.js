/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from './../lib/zhptrf.js';


// TESTS //

test( 'zhptrf is a function', function t() {
	assert.strictEqual( typeof zhptrf, 'function', 'is a function' );
});

test( 'zhptrf has expected arity', function t() {
	assert.strictEqual( zhptrf.length, 6, 'has expected arity' );
});

test( 'zhptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptrf( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zhptrf throws TypeError for row-major order (packed storage is column-major only) and leaves its arguments untouched', function t() {
	const AP = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 5.0, 0.0, 2.0, -1.0, 3.0, 0.5, 6.0, 0.0 ] );
	const IPIV = new Int32Array( 3 );
	const orig = new Float64Array( reinterpret( AP, 0 ) );
	assert.throws( function throws() {
		zhptrf( 'row-major', 'upper', 3, AP, IPIV, 1 );
	}, function check( err ) {
		assert.ok( err instanceof TypeError, 'is a TypeError' );
		assert.match( err.message, /First argument must be 'column-major'; packed storage is LAPACK column-major packed\. Value: `row-major`/ );
		return true;
	});
	assert.deepStrictEqual( reinterpret( AP, 0 ), orig, 'AP unchanged' );
	assert.deepStrictEqual( IPIV, new Int32Array( 3 ), 'IPIV unchanged' );
});
