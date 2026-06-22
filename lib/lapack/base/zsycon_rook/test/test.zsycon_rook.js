/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsyconRook from './../lib/zsycon_rook.js';


// TESTS //

test( 'zsyconRook is a function', function t() {
	assert.strictEqual( typeof zsyconRook, 'function', 'is a function' );
});

test( 'zsyconRook has expected arity', function t() {
	assert.strictEqual( zsyconRook.length, 12, 'has expected arity' );
});

test( 'zsyconRook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsyconRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zsyconRook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyconRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zsyconRook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyconRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zsyconRook throws RangeError for LDA < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		zsyconRook( 'row-major', 'upper', 3, new Complex128Array( 9 ), 1, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 6 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zsyconRook computes rcond=1 for N=0 (column-major)', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zsyconRook( 'column-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, 0.0, rcond, new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zsyconRook computes rcond=1 for N=0 (row-major)', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zsyconRook( 'row-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, 0.0, rcond, new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});
