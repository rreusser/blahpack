/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqz1 from './../lib/ndarray.js';


// VARIABLES //

var NMAX = 5;
var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlaqz1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSON line.
*
* @private
* @param {string} line - JSON string
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Find a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Convert a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - input typed array
* @returns {Array<number>} plain array copy
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts element-wise approximate equality of two flat arrays.
*
* @private
* @param {Array<number>} actual - actual values
* @param {Array<number>} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}

/**
* Build a column-major NMAX-by-NMAX complex matrix from a per-element function `(i,j) -> [re,im]`.
*
* @private
* @param {Function} fn - element generator
* @returns {Complex128Array} matrix
*/
function buildMatrix( fn ) {
	var out;
	var v;
	var i;
	var j;
	out = new Complex128Array( NMAX * NMAX );
	for ( j = 0; j < NMAX; j++ ) {
		for ( i = 0; i < NMAX; i++ ) {
			v = fn( i, j );
			out.set( v, ( j * NMAX ) + i );
		}
	}
	return out;
}

/**
* Builds the identity NMAX-by-NMAX complex matrix.
*
* @private
* @returns {Complex128Array} identity matrix
*/
function identity() {
	return buildMatrix( idGen );
}

/**
* Identity element generator.
*
* @private
* @param {integer} i - row index
* @param {integer} j - column index
* @returns {Array<number>} `[re, im]`
*/
function idGen( i, j ) {
	if ( i === j ) {
		return [ 1.0, 0.0 ];
	}
	return [ 0.0, 0.0 ];
}

/**
* Generator for test 1 A entries: dcmplx(i+2j, (i-j)*0.3).
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen1A( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	return [ i + ( 2 * j ), ( i - j ) * 0.3 ];
}

/**
* Generator for test 1 B entries: upper triangular `dcmplx((i+j)*0.5, (j-i)*0.2)`.
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen1B( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	if ( i <= j ) {
		return [ ( i + j ) * 0.5, ( j - i ) * 0.2 ];
	}
	return [ 0.0, 0.0 ];
}

/**
* Generator for test 2 A entries: dcmplx(2i+j, (j-i)*0.2).
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen2A( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	return [ ( 2 * i ) + j, ( j - i ) * 0.2 ];
}

/**
* Generator for test 2 B entries: upper triangular `dcmplx(i*j*0.4 + 1, (j-i)*0.1)`.
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen2B( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	if ( i <= j ) {
		return [ ( i * j * 0.4 ) + 1.0, ( j - i ) * 0.1 ];
	}
	return [ 0.0, 0.0 ];
}

/**
* Generator for test 3 A entries: `dcmplx(i+3j, i*j*0.1)`.
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen3A( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	return [ i + ( 3 * j ), i * j * 0.1 ];
}

/**
* Generator for test 3 B entries: upper triangular `dcmplx((i+j)*0.3 + 0.5, j*i*0.05)`.
*
* @private
* @param {integer} i0 - 0-based row
* @param {integer} j0 - 0-based column
* @returns {Array<number>} `[re, im]`
*/
function gen3B( i0, j0 ) {
	var i = i0 + 1;
	var j = j0 + 1;
	if ( i <= j ) {
		return [ ( ( i + j ) * 0.3 ) + 0.5, j * i * 0.05 ];
	}
	return [ 0.0, 0.0 ];
}


// TESTS //

test( 'zlaqz1: move bulge down (normal operation)', function t() {
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	tc = findCase( 'move_bulge_down' );
	A = buildMatrix( gen1A );
	B = buildMatrix( gen1B );

	// Inject bulge at (2,1) 0-based (Fortran (3,2) 1-based):
	B.set( [ 0.7, -0.4 ], ( 1 * NMAX ) + 2 );
	A.set( [ 1.5, 0.6 ], ( 1 * NMAX ) + 2 );

	Q = identity();
	Z = identity();

	// Fortran k=2 → 0-based k=1; istartm=1 → 0; istopm=NMAX=5 → 4; ihi=NMAX → 4
	zlaqz1( true, true, 1, 0, 4, 4, A, 1, NMAX, 0, B, 1, NMAX, 0, NMAX, 0, Q, 1, NMAX, 0, NMAX, 0, Z, 1, NMAX, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( reinterpret( Q, 0 ) ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( reinterpret( Z, 0 ) ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqz1: edge remove shift (k+1 == ihi)', function t() {
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	tc = findCase( 'edge_remove_shift' );
	A = buildMatrix( gen2A );
	B = buildMatrix( gen2B );

	// Bulge at B(5,4) Fortran 1-based → (i0=4, j0=3):
	B.set( [ 0.5, 0.3 ], ( 3 * NMAX ) + 4 );

	Q = identity();
	Z = identity();

	// Fortran k=4 → 0-based k=3; ihi=5 → 4
	zlaqz1( true, true, 3, 0, 4, 4, A, 1, NMAX, 0, B, 1, NMAX, 0, NMAX, 0, Q, 1, NMAX, 0, NMAX, 0, Z, 1, NMAX, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( reinterpret( Q, 0 ) ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( reinterpret( Z, 0 ) ), tc.Z, 1e-12, 'Z' );
});

test( 'zlaqz1: move bulge with ilq=ilz=false (Q,Z untouched)', function t() {
	var tc;
	var A;
	var B;
	var Q;
	var Z;
	tc = findCase( 'move_bulge_no_qz' );
	A = buildMatrix( gen3A );
	B = buildMatrix( gen3B );

	// Bulge at (1,0) 0-based (Fortran (2,1) 1-based):
	B.set( [ 0.6, -0.3 ], ( 0 * NMAX ) + 1 );
	A.set( [ 1.2, 0.4 ], ( 0 * NMAX ) + 1 );

	Q = identity();
	Z = identity();

	// Fortran k=1 → 0-based k=0
	zlaqz1( false, false, 0, 0, 4, 4, A, 1, NMAX, 0, B, 1, NMAX, 0, NMAX, 0, Q, 1, NMAX, 0, NMAX, 0, Z, 1, NMAX, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.B, 1e-12, 'B' );

	// Q and Z should be unchanged (still identity).
	assertArrayClose( toArray( reinterpret( Q, 0 ) ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( reinterpret( Z, 0 ) ), tc.Z, 1e-12, 'Z' );
});
