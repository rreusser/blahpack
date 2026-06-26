/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaein from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dlaein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// CONSTANTS //

// Machine constants matching the Fortran test harness (DLAMCH with IEEE-754 double precision): // eslint-disable-line max-len
var UNFL = 2.2250738585072014e-308; // 'Safe minimum'
var ULP = 1.1102230246251565e-16;  // 'Precision' (epsilon*0.5 in standard usage) // eslint-disable-line max-len


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) { return t.name === name;
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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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

// Compute the infinity-norm of an upper Hessenberg matrix (like DLANHS('I', ...)). // eslint-disable-line max-len
/**
* DlanhsInf.
*
* @private
* @param {*} n - n
* @param {*} H - H
* @param {*} ldh - ldh
* @returns {*} result
*/
function dlanhsInf( n, H, ldh ) {
	var imax;
	var vmax = 0.0;
	var s;
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		s = 0.0;
		imax = i - 1;
		if ( imax < 0 ) {
			imax = 0;
		}
		for ( j = imax; j < n; j++ ) {
			s += Math.abs( H[ ( i ) + ( j * ldh ) ] );
		}
		if ( s > vmax ) {
			vmax = s;
		}
	}
	return vmax;
}

// Build a column-major Float64Array of size ldh x n, filling from a row-major 2D array description. // eslint-disable-line max-len
/**
* BuildH.
*
* @private
* @param {*} data - data
* @param {*} ldh - ldh
* @param {*} n - n
* @returns {*} result
*/
function buildH( data, ldh, n ) {
	var H = new Float64Array( ldh * n );
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			H[ i + ( j * ldh ) ] = data[ i ][ j ];
		}
	}
	return H;
}

// Compute eps3, smlnum, bignum using the same formulas as DHSEIN.
/**
* MachineConsts.
*
* @private
* @param {*} n - n
* @param {*} hnorm - hnorm
* @returns {*} result
*/
function machineConsts( n, hnorm ) {
	var smlnum = UNFL * ( n / ULP );
	var bignum = ( 1.0 - ULP ) / smlnum;
	var eps3 = hnorm * ULP;
	if ( eps3 < smlnum ) {
		eps3 = smlnum;
	}
	return {
		'eps3': eps3,
		'smlnum': smlnum,
		'bignum': bignum
	};
}

// Run dlaein on (rightv, noinit, n, H, wr, wi, vrInit, viInit) and return { info, vr, vi }. // eslint-disable-line max-len
/**
* Run.
*
* @private
* @param {*} rightv - rightv
* @param {*} noinit - noinit
* @param {*} n - n
* @param {*} Hdata - Hdata
* @param {*} wr - wr
* @param {*} wi - wi
* @param {*} vrInit - vrInit
* @param {*} viInit - viInit
* @returns {*} result
*/
function run( rightv, noinit, n, Hdata, wr, wi, vrInit, viInit ) {
	var consts;
	var hnorm;
	var WORK = new Float64Array( n );
	var info;
	var ldh = n;
	var ldb = n + 1;
	var VR = new Float64Array( n );
	var VI = new Float64Array( n );
	var H = buildH( Hdata, ldh, n );
	var B = new Float64Array( ldb * n );
	var i;

	if ( vrInit ) {
		for ( i = 0; i < n; i++ ) {
			VR[ i ] = vrInit[ i ];
		}
	}
	if ( viInit ) {
		for ( i = 0; i < n; i++ ) {
			VI[ i ] = viInit[ i ];
		}
	}

	hnorm = dlanhsInf( n, H, ldh );
	consts = machineConsts( n, hnorm );

	info = dlaein(rightv, noinit, n, H, 1, ldh, 0, wr, wi, VR, 1, 0, VI, 1, 0, B, 1, ldb, 0, WORK, 1, 0, consts.eps3, consts.smlnum, consts.bignum); // eslint-disable-line max-len
	return {
		'info': info,
		'vr': VR,
		'vi': VI
	};
}


// DATA //

var H4 = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];
var Hcpx4 = [
	[ 0.0, -1.0, 2.0, 1.0 ],
	[ 1.0, 0.0, 1.0, 2.0 ],
	[ 0.0, 1.0, 0.0, -1.0 ],
	[ 0.0, 0.0, 1.0, 0.0 ]
];
var Htri3 = [
	[ 1.0, 2.0, 3.0 ],
	[ 0.0, 4.0, 5.0 ],
	[ 0.0, 0.0, 6.0 ]
];
var Hcpx2 = [
	[ 0.0, -2.0 ],
	[ 1.0, 0.0 ]
];
var Hone = [ [ 3.5 ] ];
var Hmix5 = [
	[ 5.0, 4.0, 1.0, 0.5, 0.1 ],
	[ 1.0, 3.0, 2.0, 1.0, 0.5 ],
	[ 0.0, 2.0, 1.0, 3.0, 1.0 ],
	[ 0.0, 0.0, 1.5, 2.0, 2.0 ],
	[ 0.0, 0.0, 0.0, 0.5, 4.0 ]
];

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaein, 'function' );
});

test( 'dlaein: right_real_noinit_4x4', function t() {
	var tc = findCase( 'right_real_noinit_4x4' );
	var r = run( true, true, 4, H4, 4.0, 0.0, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'dlaein: left_real_noinit_4x4', function t() {
	var tc = findCase( 'left_real_noinit_4x4' );
	var r = run( false, true, 4, H4, 4.0, 0.0, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'dlaein: right_complex_noinit_4x4', function t() {
	var tc = findCase( 'right_complex_noinit_4x4' );
	var r = run( true, true, 4, Hcpx4, 0.0, 1.5, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( toArray( r.vi ), tc.vi, 1e-12, 'vi' );
});

test( 'dlaein: left_complex_noinit_4x4', function t() {
	var tc = findCase( 'left_complex_noinit_4x4' );
	var r = run( false, true, 4, Hcpx4, 0.0, 1.5, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( toArray( r.vi ), tc.vi, 1e-12, 'vi' );
});

test( 'dlaein: right_real_withinit_4x4', function t() {
	var tc = findCase( 'right_real_withinit_4x4' );
	var r = run( true, false, 4, H4, 4.0, 0.0, [ 1.0, 0.5, -0.5, -1.0 ], null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'dlaein: right_real_triangular_3x3', function t() {
	var tc = findCase( 'right_real_triangular_3x3' );
	var r = run( true, true, 3, Htri3, 4.0, 0.0, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-10, 'vr' );
});

test( 'dlaein: right_complex_2x2', function t() {
	var tc = findCase( 'right_complex_2x2' );
	var r = run( true, true, 2, Hcpx2, 0.0, 1.41421356, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( toArray( r.vi ), tc.vi, 1e-12, 'vi' );
});

test( 'dlaein: n1', function t() {
	var tc = findCase( 'n1' );
	var r = run( true, true, 1, Hone, 3.5, 0.0, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'dlaein: left_real_withinit_4x4', function t() {
	var tc = findCase( 'left_real_withinit_4x4' );
	var r = run( false, false, 4, H4, 4.0, 0.0, [ 0.5, 1.0, 0.5, 0.25 ], null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'dlaein: right_complex_5x5', function t() {
	var tc = findCase( 'right_complex_5x5' );
	var r = run( true, true, 5, Hmix5, 2.5, 1.0, null, null );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( toArray( r.vr ), tc.vr, 1e-12, 'vr' );
	assertArrayClose( toArray( r.vi ), tc.vi, 1e-12, 'vi' );
});
