// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zptsv from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_single_rhs from './fixtures/basic_5x5_single_rhs.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zptsv: basic_5x5_single_rhs', function t() {
	var tc = basic_5x5_single_rhs;
	var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 2.0, 5.0, 0.0 ] );
	var info;

	info = zptsv( 5, 1, d, 1, 0, e, 1, 0, B, 1, 5, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( new Float64Array( e.buffer ), tc.e, 1e-14, 'e' );
	assertArrayClose( new Float64Array( B.buffer ), tc.b, 1e-14, 'b' );
});

test( 'zptsv: multi_rhs', function t() {
	var tc = multi_rhs;
	// 4x4 with 2 RHS, column-major: B is 4x2, LDB=4 => strideB1=1, strideB2=4
	var d = new Float64Array( [ 3.0, 3.0, 3.0, 3.0 ] );
	var e = new Complex128Array( [ 0.5, 0.5, 0.5, -0.5, 0.5, 0.5 ] );
	var B = new Complex128Array( [
		// Column 1 (RHS 1):
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
		0.0, 0.0,
		// Column 2 (RHS 2):
		2.0, 1.0,
		1.0, -1.0,
		0.0, 2.0,
		3.0, 0.0
	] );
	var bFloat;
	var info;

	info = zptsv( 4, 2, d, 1, 0, e, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( new Float64Array( e.buffer ), tc.e, 1e-14, 'e' );

	bFloat = new Float64Array( B.buffer );
	// Column 1: elements 0..7
	assertArrayClose( bFloat.subarray( 0, 8 ), tc.b1, 1e-14, 'b1' );
	// Column 2: elements 8..15
	assertArrayClose( bFloat.subarray( 8, 16 ), tc.b2, 1e-14, 'b2' );
});

test( 'zptsv: n_one', function t() {
	var tc = n_one;
	var d = new Float64Array( [ 5.0 ] );
	var e = new Complex128Array( 0 );
	var B = new Complex128Array( [ 10.0, -5.0 ] );
	var info;

	info = zptsv( 1, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assertArrayClose( new Float64Array( B.buffer ), tc.b, 1e-14, 'b' );
});

test( 'zptsv: n_zero', function t() {
	var tc = n_zero;
	var d = new Float64Array( 0 );
	var e = new Complex128Array( 0 );
	var B = new Complex128Array( 0 );
	var info;

	info = zptsv( 0, 1, d, 1, 0, e, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zptsv: not_posdef', function t() {
	var tc = not_posdef;
	var d = new Float64Array( [ -1.0, 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var info;

	info = zptsv( 3, 1, d, 1, 0, e, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'zptsv: nrhs_zero returns 0', function t() {
	var d = new Float64Array( [ 4.0, 4.0 ] );
	var e = new Complex128Array( [ 1.0, 0.0 ] );
	var B = new Complex128Array( 0 );
	var info;

	info = zptsv( 2, 0, d, 1, 0, e, 1, 0, B, 1, 2, 0 );
	assert.equal( info, 0 );
});
