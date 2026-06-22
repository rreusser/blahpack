/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, node/no-sync, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dhsein from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = fs.readFileSync( path.join( fixtureDir, 'dhsein.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );

var H4SYM = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];

var H4CPX = [
	[ 0.0, -1.0, 2.0, 1.0 ],
	[ 1.0, 0.0, 1.0, 2.0 ],
	[ 0.0, 1.0, 0.0, -1.0 ],
	[ 0.0, 0.0, 1.0, 0.0 ]
];

var H5TRI = [
	[ 1.0, 2.0, 1.0, 3.0, 0.5 ],
	[ 0.0, 2.0, 1.5, 1.0, 0.5 ],
	[ 0.0, 0.0, 3.0, 2.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 4.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 0.0, 5.0 ]
];

var H5BLK = [
	[ 2.0, 1.0, 0.5, 0.2, 0.1 ],
	[ 1.0, 3.0, 1.0, 0.3, 0.2 ],
	[ 0.0, 1.0, 4.0, 0.4, 0.3 ],
	[ 0.0, 0.0, 0.0, 5.0, 1.0 ],
	[ 0.0, 0.0, 0.0, 1.0, 6.0 ]
];

var H3TRI = [
	[ 1.0, 2.0, 3.0 ],
	[ 0.0, 4.0, 5.0 ],
	[ 0.0, 0.0, 6.0 ]
];

var TOL = 1e-12;


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( tc ) {
		return tc.name === name;
	} );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function packCM( rows, cols, data ) {
	var arr = new Float64Array( rows * cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			arr[ ( j * rows ) + i ] = data[ i ][ j ];
		}
	}
	return arr;
}

function col( mat, rows, j, n ) {
	var c = new Float64Array( n );
	var i;
	for ( i = 0; i < n; i++ ) {
		c[ i ] = mat[ ( j * rows ) + i ];
	}
	return c;
}

function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'dhsein: main export is a function', function t() {
	assert.strictEqual( typeof dhsein, 'function', 'is a function' );
} );

test( 'dhsein: side=right all 4x4', function t() {
	var tc = findCase( 'right_all_4x4' );
	var N = 4;
	var mm = 4;
	var H = packCM( N, N, H4SYM );
	var WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
	assertArrayClose( toArray( WR ), tc.wr, TOL, 'wr' );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VR, N, 1, N ) ), tc.vr2, TOL, 'vr2' );
	assertArrayClose( toArray( IFAILR ), tc.ifailr, TOL, 'ifailr' );
} );

test( 'dhsein: side=left all 4x4', function t() {
	var tc = findCase( 'left_all_4x4' );
	var N = 4;
	var mm = 4;
	var H = packCM( N, N, H4SYM );
	var WR = new Float64Array( [ 8.290547, 4.735207, 2.285640, 0.688606 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'left', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( IFAILL ), tc.ifaill, TOL, 'ifaill' );
} );

test( 'dhsein: side=both 4x4 complex eigenvalues', function t() {
	var tc = findCase( 'both_complex_4x4' );
	var N = 4;
	var mm = 4;
	var H = packCM( N, N, H4CPX );
	var WR = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	var WI = new Float64Array( [ 1.732051, -1.732051, 0.816497, -0.816497 ] );
	var SELECT = new Uint8Array( [ 1, 1, 1, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( col( VL, N, 0, N ) ), tc.vl1, TOL, 'vl1' );
	assertArrayClose( toArray( IFAILR ), tc.ifailr, TOL, 'ifailr' );
	assertArrayClose( toArray( IFAILL ), tc.ifaill, TOL, 'ifaill' );
} );

test( 'dhsein: side=right selective 5x5 (mm < N)', function t() {
	var tc = findCase( 'right_selective_5x5' );
	var N = 5;
	var mm = 3;
	var H = packCM( N, N, H5TRI );
	var WR = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( [ 1, 0, 1, 0, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
} );

test( 'dhsein: side=both eigsrc=qr block 5x5', function t() {
	var tc = findCase( 'both_fromqr_block_5x5' );
	var N = 5;
	var mm = 5;
	var H = packCM( N, N, H5BLK );
	var WR = new Float64Array( [ 1.381966, 3.0, 4.618034, 5.5, 5.5 ] );
	var WI = new Float64Array( [ 0.0, 0.0, 0.0, 1.0, -1.0 ] );
	var SELECT = new Uint8Array( [ 1, 1, 1, 1, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'both', 'qr', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
} );

test( 'dhsein: N=1 side=both', function t() {
	var tc = findCase( 'n1_both' );
	var N = 1;
	var mm = 1;
	var H = new Float64Array( [ 3.5 ] );
	var WR = new Float64Array( [ 3.5 ] );
	var WI = new Float64Array( [ 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
	assertArrayClose( toArray( VR ), tc.vr1, TOL, 'vr1' );
	assertArrayClose( toArray( VL ), tc.vl1, TOL, 'vl1' );
} );

test( 'dhsein: side=right triangular 3x3', function t() {
	var tc = findCase( 'right_triangular_3x3' );
	var N = 3;
	var mm = 3;
	var H = packCM( N, N, H3TRI );
	var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( [ 1, 1, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, tc.info );
	assert.equal( res.m, tc.m );
	assertArrayClose( toArray( col( VR, N, 0, N ) ), tc.vr1, TOL, 'vr1' );
} );

test( 'dhsein: N=0 quick return', function t() {
	var H = new Float64Array( 0 );
	var WR = new Float64Array( 0 );
	var WI = new Float64Array( 0 );
	var SELECT = new Uint8Array( 0 );
	var VL = new Float64Array( 0 );
	var VR = new Float64Array( 0 );
	var WORK = new Float64Array( 0 );
	var IFAILL = new Int32Array( 0 );
	var IFAILR = new Int32Array( 0 );
	var res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
} );

test( 'dhsein: SELECT=all-zero (m=0 quick exit on selection loop)', function t() {
	var N = 3;
	var mm = 3;
	var H = packCM( N, N, H3TRI );
	var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res = dhsein( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm=0' );
} );

test( 'dhsein: initv=user (right side)', function t() {
	var N = 3;
	var mm = 3;
	var H = packCM( N, N, H3TRI );
	var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
	var WI = new Float64Array( N );
	var SELECT = new Uint8Array( [ 0, 0, 1 ] );
	var VL = new Float64Array( N * mm );
	var VR = new Float64Array( N * mm );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( mm );
	var IFAILR = new Int32Array( mm );
	var res;

	// Pre-fill VR column 0 with a user-supplied initial vector.
	VR[ 0 ] = 1.0;
	VR[ 1 ] = 0.0;
	VR[ 2 ] = 1.0;
	res = dhsein( 'right', 'no-source', 'user', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, mm, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( typeof res.info, 'number', 'returns info' );
	assert.equal( res.m, 1, 'm=1' );
} );

test( 'dhsein: throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		var H = new Float64Array( 1 );
		var WR = new Float64Array( 1 );
		var WI = new Float64Array( 1 );
		var SELECT = new Uint8Array( 1 );
		var VL = new Float64Array( 1 );
		var VR = new Float64Array( 1 );
		var WORK = new Float64Array( 4 );
		var IFAILL = new Int32Array( 1 );
		var IFAILR = new Int32Array( 1 );
		dhsein( 'invalid', 'no-source', 'no-init', SELECT, 1, 0, 1, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	}, TypeError );
} );

test( 'dhsein: side=both is accepted (regression for isOperationSide bug)', function t() {
	var N = 1;
	var H = new Float64Array( [ 3.5 ] );
	var WR = new Float64Array( [ 3.5 ] );
	var WI = new Float64Array( [ 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var WORK = new Float64Array( ( N + 2 ) * N );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var res = dhsein( 'both', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, 0, 'info=0' );
	assert.equal( res.m, 1, 'm=1' );
} );
