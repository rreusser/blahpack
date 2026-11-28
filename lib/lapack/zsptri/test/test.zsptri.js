/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsptri from './../lib/zsptri.js';


// TESTS //

test( 'zsptri is a function', function t() {
	assert.strictEqual( typeof zsptri, 'function', 'is a function' );
});

test( 'zsptri has expected arity', function t() {
	assert.strictEqual( zsptri.length, 7, 'has expected arity' );
});

test( 'zsptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zsptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsptri( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zsptri throws TypeError for row-major order (packed storage is column-major only)', function t() {
	const AP = new Complex128Array( [ 4.0, 2.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	assert.throws( function throws() {
		zsptri( 'row-major', 'upper', 1, AP, IPIV, 1, null );
	}, {
		'name': 'TypeError',
		'message': 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `row-major`.'
	});
	assert.deepStrictEqual( Array.from( new Float64Array( AP.buffer ) ), [ 4.0, 2.0 ], 'AP is untouched' );
});
