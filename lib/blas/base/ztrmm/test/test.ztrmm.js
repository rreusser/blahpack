/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrmm from './../lib/ztrmm.js';


// TESTS //

test( 'ztrmm is a function', function t() {
	assert.strictEqual( typeof ztrmm, 'function', 'is a function' );
});

test( 'ztrmm has expected arity', function t() {
	assert.strictEqual( ztrmm.length, 12, 'has expected arity' );
});

test( 'ztrmm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrmm( 'invalid', 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrmm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'invalid', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrmm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'invalid', 'no-transpose', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrmm throws TypeError for invalid transa', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrmm throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrmm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztrmm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztrmm throws RangeError for column-major LDB < max(1,M)', function t() {
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	assert.throws( function throws() {
		ztrmm( 'column-major', 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 2, B, 1 );
	}, RangeError );
});

test( 'ztrmm throws RangeError for row-major LDB < max(1,N)', function t() {
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 2, B, 1 );
	}, RangeError );
});

test( 'ztrmm throws RangeError for column-major LDA < max(1,M)', function t() {
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	assert.throws( function throws() {
		ztrmm( 'column-major', 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, B, 2 );
	}, RangeError );
});

test( 'ztrmm throws RangeError for row-major LDA < max(1,N)', function t() {
	var A = new Complex128Array( 4 );
	var B = new Complex128Array( 4 );
	assert.throws( function throws() {
		ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, B, 2 );
	}, RangeError );
});

test( 'ztrmm runs for column-major layout', function t() {
	// 1x1 column-major: A=[2], B=[3], alpha=1 → B=[6]
	var Aflat = new Float64Array( [ 2, 0 ] );
	var Bflat = new Float64Array( [ 3, 0 ] );
	var A = new Complex128Array( Aflat.buffer );
	var B = new Complex128Array( Bflat.buffer );
	ztrmm( 'column-major', 'left', 'upper', 'no-transpose', 'non-unit', 1, 1, new Complex128( 1, 0 ), A, 1, B, 1 );
	var f = new Float64Array( B.buffer );
	assert.strictEqual( f[ 0 ], 6 );
});

test( 'ztrmm runs for row-major layout', function t() {
	// Row-major 1x1: same.
	var Aflat = new Float64Array( [ 2, 0 ] );
	var Bflat = new Float64Array( [ 3, 0 ] );
	var A = new Complex128Array( Aflat.buffer );
	var B = new Complex128Array( Bflat.buffer );
	ztrmm( 'row-major', 'left', 'upper', 'no-transpose', 'non-unit', 1, 1, new Complex128( 1, 0 ), A, 1, B, 1 );
	var f = new Float64Array( B.buffer );
	assert.strictEqual( f[ 0 ], 6 );
});
