/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zheconRook from './../lib/zhecon_rook.js';


// TESTS //

test( 'zheconRook is a function', function t() {
	assert.strictEqual( typeof zheconRook, 'function', 'is a function' );
});

test( 'zheconRook has expected arity', function t() {
	assert.strictEqual( zheconRook.length, 12, 'has expected arity' );
});

test( 'zheconRook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zheconRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zheconRook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheconRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zheconRook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheconRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 4 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zheconRook throws RangeError for LDA < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		zheconRook( 'row-major', 'upper', 3, new Complex128Array( 9 ), 1, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 6 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zheconRook computes rcond=1 for N=0 (column-major)', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zheconRook( 'column-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, 0.0, rcond, new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zheconRook computes rcond=1 for N=0 (row-major)', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zheconRook( 'row-major', 'upper', 0, new Complex128Array( 1 ), 1, new Int32Array( 1 ), 1, 0, 0.0, rcond, new Complex128Array( 2 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});
