/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, node/no-sync */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import ztprfb from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'ztprfb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) {
		return t.name === name;
	} );
}

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Copies a typed array to a plain JavaScript array (slice).
*
* @private
* @param {*} typed - typed array
* @param {NonNegativeInteger} n - number of elements to copy
* @returns {Array} plain array
*/
function toArray( typed, n ) {
	var out = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		out.push( typed[ i ] );
	}
	return out;
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a Complex128Array for V matching the Fortran `fill_all` values.
*
* @private
* @returns {Complex128Array} V
*/
function makeV() {
	var arr;
	var re;
	var im;
	var v;
	var k;

	arr = new Complex128Array( 64 );
	v = reinterpret( arr, 0 );
	for ( k = 1; k <= 64; k++ ) {
		re = 0.1 * k;
		im = -0.05 * k;
		v[ (k-1)*2 ] = re;
		v[ ((k-1)*2) + 1 ] = im;
	}
	return arr;
}

/**
* Builds T for test reproduction.
*
* @private
* @returns {Complex128Array} T
*/
function makeT() {
	var arr = new Complex128Array( 16 );
	var v = reinterpret( arr, 0 );
	v[ 0 ] = 1.1;
	v[ 1 ] = 0.1;
	v[ 2 ] = 0.25;
	v[ 3 ] = -0.15;
	v[ 4 ] = -0.35;
	v[ 5 ] = 0.1;
	v[ 6 ] = 0.3;
	v[ 7 ] = -0.2;
	v[ 8 ] = 1.2;
	v[ 9 ] = -0.1;
	v[ 10 ] = 0.45;
	v[ 11 ] = 0.2;
	v[ 12 ] = 0.2;
	v[ 13 ] = 0.4;
	v[ 14 ] = -0.1;
	v[ 15 ] = 0.3;
	v[ 16 ] = 1.3;
	v[ 17 ] = 0.05;
	return arr;
}

/**
* Builds A for test reproduction.
*
* @private
* @returns {Complex128Array} A
*/
function makeA() {
	var arr;
	var re;
	var im;
	var v;
	var k;

	arr = new Complex128Array( 16 );
	v = reinterpret( arr, 0 );
	for ( k = 1; k <= 16; k++ ) {
		re = 0.5 + (0.1 * k);
		im = 0.2 - (0.03 * k);
		v[ (k-1)*2 ] = re;
		v[ ((k-1)*2) + 1 ] = im;
	}
	return arr;
}

/**
* Builds B for test reproduction.
*
* @private
* @returns {Complex128Array} B
*/
function makeB() {
	var arr;
	var re;
	var im;
	var v;
	var k;

	arr = new Complex128Array( 64 );
	v = reinterpret( arr, 0 );
	for ( k = 1; k <= 64; k++ ) {
		re = -0.3 + (0.07 * k);
		im = 0.15 + (0.02 * k);
		v[ (k-1)*2 ] = re;
		v[ ((k-1)*2) + 1 ] = im;
	}
	return arr;
}

/**
* Builds the WORK array.
*
* @private
* @param {NonNegativeInteger} n - size
* @returns {Complex128Array} WORK
*/
function makeWork( n ) {
		return new Complex128Array( n );
	}


// TESTS //

test( 'ztprfb: is a function', function t() {
	assert.strictEqual( typeof ztprfb, 'function', 'is a function' );
});

test( 'ztprfb: expected arity', function t() {
	assert.strictEqual( ztprfb.length, 28, 'has expected arity' );
});

test( 'ztprfb: quick return for M=0 does not throw', function t() {
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	assert.doesNotThrow( function ok() {
		ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	});
});

test( 'ztprfb: column forward left, no-transpose', function t() {
	var tc = findCase( 'ztprfb_col_fwd_left_N' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: column forward left, conjugate-transpose', function t() {
	var tc = findCase( 'ztprfb_col_fwd_left_C' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: column forward right, no-transpose', function t() {
	var tc = findCase( 'ztprfb_col_fwd_right_N' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'right', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 4, 0, T, 1, 3, 0, A, 1, 5, 0, B, 1, 5, 0, W, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 30 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: column backward left, conjugate-transpose', function t() {
	var tc = findCase( 'ztprfb_col_bwd_left_C' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'conjugate-transpose', 'backward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: column backward right, no-transpose', function t() {
	var tc = findCase( 'ztprfb_col_bwd_right_N' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'right', 'no-transpose', 'backward', 'columnwise', 5, 4, 3, 2, V, 1, 4, 0, T, 1, 3, 0, A, 1, 5, 0, B, 1, 5, 0, W, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 30 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: row forward left, no-transpose', function t() {
	var tc = findCase( 'ztprfb_row_fwd_left_N' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'no-transpose', 'forward', 'rowwise', 5, 4, 3, 2, V, 1, 3, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: row forward right, conjugate-transpose', function t() {
	var tc = findCase( 'ztprfb_row_fwd_right_C' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'right', 'conjugate-transpose', 'forward', 'rowwise', 5, 4, 3, 2, V, 1, 3, 0, T, 1, 3, 0, A, 1, 5, 0, B, 1, 5, 0, W, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 30 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: row backward left, no-transpose', function t() {
	var tc = findCase( 'ztprfb_row_bwd_left_N' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'no-transpose', 'backward', 'rowwise', 5, 4, 3, 2, V, 1, 3, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: row backward right, conjugate-transpose', function t() {
	var tc = findCase( 'ztprfb_row_bwd_right_C' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'right', 'conjugate-transpose', 'backward', 'rowwise', 5, 4, 3, 2, V, 1, 3, 0, T, 1, 3, 0, A, 1, 5, 0, B, 1, 5, 0, W, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 30 ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ), 40 ), tc.B, 1e-13, 'B' );
});

test( 'ztprfb: quick return (M=0)', function t() {
	var tc = findCase( 'ztprfb_quick_return' );
	var V = makeV();
	var T = makeT();
	var A = makeA();
	var B = makeB();
	var W = makeWork( 64 );
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( A, 0 ), 24 ), tc.A, 1e-13, 'A' );
});
