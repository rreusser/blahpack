

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgex2 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztgex2.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

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

/**
* Creates an NxN identity Complex128Array (column-major).
*
* @private
* @param {integer} N - dimension
* @returns {Complex128Array} identity matrix
*/
function eye( N ) {
	var out = new Complex128Array( N * N );
	var v = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		v[ 2 * ( i + ( i * N ) ) ] = 1.0;
	}
	return out;
}


// TESTS //

test( 'ztgex2: basic 2x2 swap wantq=T wantz=T', function t() {
	var tc = findCase( 'basic 2x2 swap wantq=T wantz=T' );
	var info;
	var N = 2;

	// Column-major: [A(1,1), A(2,1), A(1,2), A(2,2)]
	var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
	var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=1 -> JS j1=0
	info = ztgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, 1e-14, 'Z' );
});

test( 'ztgex2: 4x4 swap at j1=2 wantq=T wantz=T', function t() {
	var tc = findCase( '4x4 swap at j1=2 wantq=T wantz=T' );
	var info;
	var N = 4;

	// Column-major 4x4
	var A = new Complex128Array([
		3.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.5, 0.2, 1.0, -0.5, 0.0, 0.0, 0.0, 0.0,
		0.1, -0.1, 0.4, 0.3, 5.0, 0.0, 0.0, 0.0,
		0.05, 0.02, 0.2, -0.1, 0.6, 0.1, 2.0, 0.8
	]);
	var B = new Complex128Array([
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.1, 0.1, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.05, 0.0, 0.15, -0.05, 1.0, 0.0, 0.0, 0.0,
		0.02, -0.01, 0.08, 0.03, 0.12, 0.04, 1.0, 0.0
	]);
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=2 -> JS j1=1
	info = ztgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, 1e-14, 'Z' );
});

test( 'ztgex2: 4x4 swap at j1=3 wantq=T wantz=T', function t() {
	var tc = findCase( '4x4 swap at j1=3 wantq=T wantz=T' );
	var info;
	var N = 4;
	var A = new Complex128Array([
		3.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.5, 0.2, 1.0, -0.5, 0.0, 0.0, 0.0, 0.0,
		0.1, -0.1, 0.4, 0.3, 5.0, 0.0, 0.0, 0.0,
		0.05, 0.02, 0.2, -0.1, 0.6, 0.1, 2.0, 0.8
	]);
	var B = new Complex128Array([
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.1, 0.1, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.05, 0.0, 0.15, -0.05, 1.0, 0.0, 0.0, 0.0,
		0.02, -0.01, 0.08, 0.03, 0.12, 0.04, 1.0, 0.0
	]);
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=3 -> JS j1=2
	info = ztgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 2 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, 1e-14, 'Z' );
});

test( 'ztgex2: 3x3 swap at j1=1 wantq=F wantz=F', function t() {
	var tc = findCase( '3x3 swap at j1=1 wantq=F wantz=F' );
	var info;
	var N = 3;

	// Column-major 3x3
	var A = new Complex128Array([
		2.0, 1.0, 0.0, 0.0, 0.0, 0.0,
		0.5, -0.2, 4.0, -1.0, 0.0, 0.0,
		0.1, 0.1, 0.3, 0.4, 1.0, 0.0
	]);
	var B = new Complex128Array([
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.2, 0.1, 1.0, 0.0, 0.0, 0.0,
		0.05, -0.02, 0.1, 0.05, 1.0, 0.0
	]);
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=1 -> JS j1=0
	info = ztgex2( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
});

test( 'ztgex2: N=1 quick return', function t() {
	var tc = findCase( 'N=1 quick return' );
	var info;
	var A = new Complex128Array( [ 5.0, 1.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0 ] );
	var Q = new Complex128Array( 1 );
	var Z = new Complex128Array( 1 );

	info = ztgex2( true, true, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0 );

	assert.equal( info, tc.info );
});

test( 'ztgex2: 4x4 swap at j1=1 wantq=T wantz=T', function t() {
	var tc = findCase( '4x4 swap at j1=1 wantq=T wantz=T' );
	var info;
	var N = 4;
	var A = new Complex128Array([
		1.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.7, -0.3, 3.0, -1.0, 0.0, 0.0, 0.0, 0.0,
		0.2, 0.1, 0.5, 0.4, 5.0, 0.5, 0.0, 0.0,
		0.15, -0.05, 0.25, 0.1, 0.8, -0.2, 7.0, 0.0
	]);
	var B = new Complex128Array([
		2.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.3, 0.2, 1.5, -0.3, 0.0, 0.0, 0.0, 0.0,
		0.1, -0.05, 0.2, 0.1, 3.0, 0.0, 0.0, 0.0,
		0.04, 0.01, 0.06, -0.02, 0.15, 0.08, 0.5, 0.1
	]);
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=1 -> JS j1=0
	info = ztgex2( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-14, 'Q' );
	assertArrayClose( Array.from( reinterpret( Z, 0 ) ), tc.Z, 1e-14, 'Z' );
});

test( 'ztgex2: 3x3 swap at j1=2 wantq=T wantz=F', function t() {
	var tc = findCase( '3x3 swap at j1=2 wantq=T wantz=F' );
	var info;
	var N = 3;
	var A = new Complex128Array([
		2.0, 1.0, 0.0, 0.0, 0.0, 0.0,
		0.5, -0.2, 4.0, -1.0, 0.0, 0.0,
		0.1, 0.1, 0.3, 0.4, 1.0, 0.0
	]);
	var B = new Complex128Array([
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.2, 0.1, 1.0, 0.0, 0.0, 0.0,
		0.05, -0.02, 0.1, 0.05, 1.0, 0.0
	]);
	var Q = eye( N );
	var Z = eye( N );

	// Fortran J1=2 -> JS j1=1
	info = ztgex2( true, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
	assertArrayClose( Array.from( reinterpret( B, 0 ) ), tc.B, 1e-14, 'B' );
	assertArrayClose( Array.from( reinterpret( Q, 0 ) ), tc.Q, 1e-14, 'Q' );
});
