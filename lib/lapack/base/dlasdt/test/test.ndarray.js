/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasdt from './../lib/index.js';

// FIXTURES //

import n15_msub6 from './fixtures/n15_msub6.json' with { type: 'json' };
import n1_msub6 from './fixtures/n1_msub6.json' with { type: 'json' };
import n2_msub6 from './fixtures/n2_msub6.json' with { type: 'json' };
import n31_msub6 from './fixtures/n31_msub6.json' with { type: 'json' };
import n63_msub12 from './fixtures/n63_msub12.json' with { type: 'json' };
import n7_msub2 from './fixtures/n7_msub2.json' with { type: 'json' };
import n100_msub25 from './fixtures/n100_msub25.json' with { type: 'json' };

// FUNCTIONS //

/**
* Helper to run dlasdt and compare against Fortran fixture.
*
* @private
* @param {Object} tc - test case from fixture
*/
function runTest( tc ) {
	var strideINODE;
	var offsetINODE;
	var strideNDIML;
	var offsetNDIML;
	var strideNDIMR;
	var offsetNDIMR;
	var INODE;
	var NDIML;
	var NDIMR;
	var lvl;
	var nd;
	var i;

	lvl = new Int32Array( 1 );
	nd = new Int32Array( 1 );
	INODE = new Int32Array( ( tc.N > 0 ) ? tc.N : 1 );
	NDIML = new Int32Array( ( tc.N > 0 ) ? tc.N : 1 );
	NDIMR = new Int32Array( ( tc.N > 0 ) ? tc.N : 1 );
	strideINODE = 1;
	offsetINODE = 0;
	strideNDIML = 1;
	offsetNDIML = 0;
	strideNDIMR = 1;
	offsetNDIMR = 0;

	dlasdt.ndarray( tc.N, lvl, nd, INODE, strideINODE, offsetINODE, NDIML, strideNDIML, offsetNDIML, NDIMR, strideNDIMR, offsetNDIMR, tc.MSUB ); // eslint-disable-line max-len

	assert.strictEqual( lvl[ 0 ], tc.LVL, 'LVL' );
	assert.strictEqual( nd[ 0 ], tc.ND, 'ND' );

	// INODE values are 0-based in JS, 1-based in Fortran fixture:
	for ( i = 0; i < tc.ND; i += 1 ) {
		assert.strictEqual( INODE[ i ], tc.INODE[ i ] - 1, 'INODE[' + i + ']' );
	}

	// NDIML and NDIMR are counts (not indices), same in both:
	for ( i = 0; i < tc.ND; i += 1 ) {
		assert.strictEqual( NDIML[ i ], tc.NDIML[ i ], 'NDIML[' + i + ']' );
	}
	for ( i = 0; i < tc.ND; i += 1 ) {
		assert.strictEqual( NDIMR[ i ], tc.NDIMR[ i ], 'NDIMR[' + i + ']' );
	}
}

// TESTS //

test( 'dlasdt: main export is a function', function t() {
	assert.strictEqual( typeof dlasdt, 'function' );
});

test( 'dlasdt: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasdt.ndarray, 'function' );
});

test( 'dlasdt: n15_msub6', function t() {
	runTest( n15_msub6 );
});

test( 'dlasdt: n1_msub6', function t() {
	runTest( n1_msub6 );
});

test( 'dlasdt: n2_msub6', function t() {
	runTest( n2_msub6 );
});

test( 'dlasdt: n31_msub6', function t() {
	runTest( n31_msub6 );
});

test( 'dlasdt: n63_msub12', function t() {
	runTest( n63_msub12 );
});

test( 'dlasdt: n7_msub2', function t() {
	runTest( n7_msub2 );
});

test( 'dlasdt: n100_msub25', function t() {
	runTest( n100_msub25 );
});

test( 'dlasdt: non-unit stride', function t() {
	var strideINODE;
	var offsetINODE;
	var strideNDIML;
	var offsetNDIML;
	var strideNDIMR;
	var offsetNDIMR;
	var INODE;
	var NDIML;
	var NDIMR;
	var lvl;
	var nd;
	var N;

	N = 15;
	lvl = new Int32Array( 1 );
	nd = new Int32Array( 1 );
	INODE = new Int32Array( 2 * N + 1 );
	NDIML = new Int32Array( 2 * N + 1 );
	NDIMR = new Int32Array( 2 * N + 1 );
	strideINODE = 2;
	offsetINODE = 1;
	strideNDIML = 2;
	offsetNDIML = 1;
	strideNDIMR = 2;
	offsetNDIMR = 1;
	dlasdt.ndarray( N, lvl, nd, INODE, strideINODE, offsetINODE, NDIML, strideNDIML, offsetNDIML, NDIMR, strideNDIMR, offsetNDIMR, 6 ); // eslint-disable-line max-len
	assert.strictEqual( lvl[ 0 ], 2, 'LVL' );
	assert.strictEqual( nd[ 0 ], 3, 'ND' );
	assert.strictEqual( INODE[ 1 ], 7, 'INODE[0] at offset 1' );
	assert.strictEqual( INODE[ 3 ], 3, 'INODE[1] at offset 1 + stride 2' );
	assert.strictEqual( INODE[ 5 ], 11, 'INODE[2] at offset 1 + 2*stride 2' );
	assert.strictEqual( NDIML[ 1 ], 7, 'NDIML[0]' );
	assert.strictEqual( NDIML[ 3 ], 3, 'NDIML[1]' );
	assert.strictEqual( NDIML[ 5 ], 3, 'NDIML[2]' );
	assert.strictEqual( NDIMR[ 1 ], 7, 'NDIMR[0]' );
	assert.strictEqual( NDIMR[ 3 ], 3, 'NDIMR[1]' );
	assert.strictEqual( NDIMR[ 5 ], 3, 'NDIMR[2]' );
	assert.strictEqual( INODE[ 0 ], 0, 'INODE untouched at 0' );
	assert.strictEqual( INODE[ 2 ], 0, 'INODE untouched at 2' );
	assert.strictEqual( INODE[ 4 ], 0, 'INODE untouched at 4' );
});

test( 'dlasdt: tree structure is consistent (subproblem sizes sum to N)', function t() { // eslint-disable-line max-len
	var INODE;
	var NDIML;
	var NDIMR;
	var total;
	var lvl;
	var nd;
	var N;
	var i;

	N = 63;
	lvl = new Int32Array( 1 );
	nd = new Int32Array( 1 );
	INODE = new Int32Array( N );
	NDIML = new Int32Array( N );
	NDIMR = new Int32Array( N );
	dlasdt.ndarray( N, lvl, nd, INODE, 1, 0, NDIML, 1, 0, NDIMR, 1, 0, 12 );
	assert.strictEqual( NDIML[ 0 ] + NDIMR[ 0 ] + 1, N, 'root splits sum to N' );
	total = 0;
	for ( i = 0; i < nd[ 0 ]; i += 1 ) {
		total += 1; // count the center node itself
	}
	assert.ok( nd[ 0 ] > 0, 'ND > 0' );
	assert.ok( lvl[ 0 ] >= 1, 'LVL >= 1' );
});
