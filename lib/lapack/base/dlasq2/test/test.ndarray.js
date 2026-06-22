/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq2 from './../lib/ndarray.js';

// FIXTURES //

import n0 from './fixtures/n0.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import n2 from './fixtures/n2.json' with { type: 'json' };
import n2_swap from './fixtures/n2_swap.json' with { type: 'json' };
import n3_basic from './fixtures/n3_basic.json' with { type: 'json' };
import n4_basic from './fixtures/n4_basic.json' with { type: 'json' };
import n3_diagonal from './fixtures/n3_diagonal.json' with { type: 'json' };
import n5_basic from './fixtures/n5_basic.json' with { type: 'json' };
import n3_reversal from './fixtures/n3_reversal.json' with { type: 'json' };
import n4_identity_like from './fixtures/n4_identity_like.json' with { type: 'json' };
import n2_zero_offdiag from './fixtures/n2_zero_offdiag.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
		return;
	}
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a Float64Array of given size, optionally initialized from an object.
* mapping 1-based indices to values.
*/
function createZ( size, vals ) {
	var z = new Float64Array( size );
	var k;
	if ( vals ) {
		for ( k = 0; k < vals.length; k++ ) {
			z[ k ] = vals[ k ];
		}
	}
	return z;
}

// TESTS //

test( 'dlasq2: n0 - quick return', function t() {
	var info;
	var tc;
	var z;

	tc = n0;
	z = createZ( 4 );
	info = dlasq2( 0, z, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'dlasq2: n1 - single element', function t() {
	var info;
	var tc;
	var z;

	tc = n1;
	z = createZ( 100, [ 4.0 ] );
	info = dlasq2( 1, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2 - basic 2-by-2', function t() {
	var info;
	var tc;
	var z;

	tc = n2;
	z = createZ( 100, [ 4.0, 1.0, 3.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2_swap - swap case', function t() {
	var info;
	var tc;
	var z;

	tc = n2_swap;
	z = createZ( 100, [ 2.0, 1.0, 5.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_basic', function t() {
	var info;
	var tc;
	var z;

	tc = n3_basic;
	z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, 2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n4_basic', function t() {
	var info;
	var tc;
	var z;

	tc = n4_basic;
	z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, 5.0, 0.3, 2.0 ] );
	info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_diagonal - all off-diag zero', function t() {
	var info;
	var tc;
	var z;

	tc = n3_diagonal;
	z = createZ( 100, [ 4.0, 0.0, 3.0, 0.0, 2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n5_basic', function t() {
	var info;
	var tc;
	var z;

	tc = n5_basic;
	z = createZ( 100, [ 9.0, 1.0, 8.0, 0.5, 7.0, 0.3, 6.0, 0.2, 5.0 ] );
	info = dlasq2( 5, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n3_reversal - triggers reversal', function t() {
	var info;
	var tc;
	var z;

	tc = n3_reversal;
	z = createZ( 100, [ 1.0, 0.5, 2.0, 0.3, 10.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n4_identity_like', function t() {
	var info;
	var tc;
	var z;

	tc = n4_identity_like;
	z = createZ( 100, [ 1.0, 0.1, 1.0, 0.1, 1.0, 0.1, 1.0 ] );
	info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

test( 'dlasq2: n2_zero_offdiag', function t() {
	var info;
	var tc;
	var z;

	tc = n2_zero_offdiag;
	z = createZ( 100, [ 4.0, 0.0, 3.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
});

// Error cases (not in Fortran fixtures, but test JS behavior)
test( 'dlasq2: throws RangeError for N<0', function t() {
	var z = createZ( 4 );
	assert.throws( function() {
		dlasq2( -1, z, 1, 0 );
	}, RangeError );
});

test( 'dlasq2: N=1 negative z returns -201', function t() {
	var info;
	var z;

	z = createZ( 100, [ -1.0 ] );
	info = dlasq2( 1, z, 1, 0 );
	assert.strictEqual( info, -201 );
});

test( 'dlasq2: N=2 negative z(2) returns -202', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, -1.0, 3.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -202 );
});

test( 'dlasq2: N=2 negative z(3) returns -203', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, 1.0, -3.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -203 );
});

test( 'dlasq2: N=2 negative z(1) returns -201', function t() {
	var info;
	var z;

	z = createZ( 100, [ -4.0, 1.0, 3.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, -201 );
});

test( 'dlasq2: N=2 s>t branch', function t() {
	var info;
	var z;

	z = createZ( 100, [ 1.0, 10.0, 1.0 ] );
	info = dlasq2( 2, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( z[ 0 ], 11.916079783099615, 1e-14, 'd[0]' );
	assertClose( z[ 1 ], 0.08392021690038397, 1e-14, 'd[1]' );
});

test( 'dlasq2: N>=3 negative diagonal returns error', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, 1.0, -3.0, 0.5, 2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -203 );
});

test( 'dlasq2: N>=3 negative off-diagonal returns error', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, -1.0, 3.0, 0.5, 2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -202 );
});

test( 'dlasq2: N>=3 negative last diagonal returns error', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, 1.0, 3.0, 0.5, -2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, -205 );
});

test( 'dlasq2: n5_split - matrix with zero off-diagonal (split)', function t() {
	var info;
	var z;

	z = createZ( 100, [ 9.0, 1.0, 8.0, 0.0, 7.0, 0.5, 6.0, 0.3, 5.0 ] );
	info = dlasq2( 5, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
	assert.ok( z[ 1 ] >= z[ 2 ], 'd[1] >= d[2]' );
});

test( 'dlasq2: n3_tiny_offdiag - nearly diagonal', function t() {
	var info;
	var z;

	z = createZ( 100, [ 4.0, 1e-20, 3.0, 1e-20, 2.0 ] );
	info = dlasq2( 3, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( z[ 0 ], 4.0, 1e-10, 'd[0]' );
	assertClose( z[ 1 ], 3.0, 1e-10, 'd[1]' );
	assertClose( z[ 2 ], 2.0, 1e-10, 'd[2]' );
});

test( 'dlasq2: n4_ascending - ascending diagonals trigger aggressive dqds', function t() { // eslint-disable-line max-len
	var info;
	var z;

	z = createZ( 100, [ 1.0, 0.5, 1.0, 0.5, 1.0, 0.5, 10.0 ] );
	info = dlasq2( 4, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n8_ascending - ascending pattern for aggressive dqds', function t() { // eslint-disable-line max-len
	var info;
	var z;

	z = createZ( 200, [
		0.1,
		0.5,
		0.2,
		0.5,
		0.3,
		0.5,
		0.5,
		0.5,
		1.0,
		0.5,
		2.0,
		0.5,
		5.0,
		0.5,
		10.0
	]);
	info = dlasq2( 8, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n10_ascending - larger ascending for aggressive dqds reversal', function t() { // eslint-disable-line max-len
	var vals;
	var info;
	var i;
	var z;

	vals = [];
	for ( i = 0; i < 9; i++ ) {
		vals.push( ( i + 1 ) * 0.01 );
		vals.push( 0.01 );
	}
	vals.push( 100.0 );
	z = createZ( 200, vals );
	info = dlasq2( 10, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n6_tiny_then_large - triggers aggressive dqds pp=2 reversal', function t() { // eslint-disable-line max-len
	var info;
	var z;

	z = createZ( 200, [ 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 0.001, 0.1, 100.0 ] ); // eslint-disable-line max-len
	info = dlasq2( 6, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});

test( 'dlasq2: n8_graded - graded matrix for aggressive dqds', function t() {
	var info;
	var z;

	z = createZ( 200, [
		1e-8,
		1e-4,
		1e-6,
		1e-4,
		1e-4,
		1e-4,
		1e-2,
		1e-4,
		1.0,
		1e-4,
		1e2,
		1e-4,
		1e4,
		1e-4,
		1e6
	]);
	info = dlasq2( 8, z, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( z[ 0 ] >= z[ 1 ], 'd[0] >= d[1]' );
});
