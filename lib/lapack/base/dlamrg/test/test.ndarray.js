/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamrg from './../lib/ndarray.js';

// FIXTURES //

import fwd_fwd_3_3 from './fixtures/fwd_fwd_3_3.json' with { type: 'json' };
import fwd_bwd_3_3 from './fixtures/fwd_bwd_3_3.json' with { type: 'json' };
import bwd_fwd_3_2 from './fixtures/bwd_fwd_3_2.json' with { type: 'json' };
import bwd_bwd_2_3 from './fixtures/bwd_bwd_2_3.json' with { type: 'json' };
import n1_n1 from './fixtures/n1_n1.json' with { type: 'json' };
import equal from './fixtures/equal.json' with { type: 'json' };
import n4_n1 from './fixtures/n4_n1.json' with { type: 'json' };

// TESTS //

test( 'dlamrg: both forward, 3+3', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = fwd_fwd_3_3;
	a = new Float64Array( [ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ] );
	idx = new Int32Array( 6 );
	dlamrg( 3, 3, a, 1, 0, 1, 1, idx, 1, 0 );
	for ( i = 0; i < 6; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: first forward, second backward, 3+3', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = fwd_bwd_3_3;
	a = new Float64Array( [ 1.0, 3.0, 5.0, 6.0, 4.0, 2.0 ] );
	idx = new Int32Array( 6 );
	dlamrg( 3, 3, a, 1, 0, 1, -1, idx, 1, 0 );
	for ( i = 0; i < 6; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: first backward, second forward, 3+2', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = bwd_fwd_3_2;
	a = new Float64Array( [ 5.0, 3.0, 1.0, 2.0, 4.0 ] );
	idx = new Int32Array( 5 );
	dlamrg( 3, 2, a, 1, 0, -1, 1, idx, 1, 0 );
	for ( i = 0; i < 5; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: both backward, 2+3', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = bwd_bwd_2_3;
	a = new Float64Array( [ 4.0, 2.0, 6.0, 3.0, 1.0 ] );
	idx = new Int32Array( 5 );
	dlamrg( 2, 3, a, 1, 0, -1, -1, idx, 1, 0 );
	for ( i = 0; i < 5; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: n1=1, n1=1', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = n1_n1;
	a = new Float64Array( [ 3.0, 1.0 ] );
	idx = new Int32Array( 2 );
	dlamrg( 1, 1, a, 1, 0, 1, 1, idx, 1, 0 );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: equal elements', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = equal;
	a = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	idx = new Int32Array( 4 );
	dlamrg( 2, 2, a, 1, 0, 1, 1, idx, 1, 0 );
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});

test( 'dlamrg: n1=4, n2=1', function t() {
	var idx;
	var tc;
	var a;
	var i;

	tc = n4_n1;
	a = new Float64Array( [ 1.0, 3.0, 5.0, 7.0, 4.0 ] );
	idx = new Int32Array( 5 );
	dlamrg( 4, 1, a, 1, 0, 1, 1, idx, 1, 0 );
	for ( i = 0; i < 5; i++ ) {
		assert.strictEqual( idx[ i ], tc.index[ i ], 'index[' + i + ']' );
	}
});
