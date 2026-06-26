/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zhsein from './../lib/ndarray.js';
import zhseinBase from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zhsein.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

function viewBuf( cmplxArr ) {
	return new Float64Array( cmplxArr.buffer, cmplxArr.byteOffset, cmplxArr.length * 2 );
}

function buildH( N, ld, entries ) {
	var arr = new Complex128Array( ld * N );
	var buf = viewBuf( arr );
	var i;
	var t;
	var idx;
	for ( i = 0; i < entries.length; i++ ) {
		t = entries[ i ];
		idx = ( ( ( t[ 1 ] - 1 ) * ld ) + ( t[ 0 ] - 1 ) ) * 2;
		buf[ idx ] = t[ 2 ];
		buf[ idx + 1 ] = t[ 3 ];
	}
	return arr;
}

function buildW( entries ) {
	var arr = new Complex128Array( entries.length );
	var buf = viewBuf( arr );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		buf[ i * 2 ] = entries[ i ][ 0 ];
		buf[ ( i * 2 ) + 1 ] = entries[ i ][ 1 ];
	}
	return arr;
}

function makeSel( N, idxs ) {
	var s = new Uint8Array( N );
	var i;
	for ( i = 0; i < idxs.length; i++ ) {
		s[ idxs[ i ] - 1 ] = 1;
	}
	return s;
}

/**
* Compares column k (0-based) of a Complex128Array (LDV-padded) to a flat re/im list.
*/
function compareColumn( v, ld, col, expectedFlat, N, msg, tol ) {
	var buf = viewBuf( v );
	var i;
	var idx;
	for ( i = 0; i < N; i++ ) {
		idx = ( ( col * ld ) + i ) * 2;
		assertClose( buf[ idx ], expectedFlat[ i * 2 ], tol, format( '%s.re[%d]', msg, i ) );
		assertClose( buf[ idx + 1 ], expectedFlat[ ( i * 2 ) + 1 ], tol, format( '%s.im[%d]', msg, i ) );
	}
}

/**
* Returns an info value from either an integer (if wrapper returns integer) or object result.
*/
function getInfo( res ) {
	if ( typeof res === 'object' && res !== null ) {
		return res.info;
	}
	return res;
}

// Helper to set up and run zhsein.
function runRight( name, N, H, w, SELECT ) {
	var ld = N;
	var VL = new Complex128Array( ld * N );
	var VR = new Complex128Array( ld * N );
	var WORK = new Complex128Array( N * N );
	var RWORK = new Float64Array( N );
	var IFAILL = new Int32Array( N );
	var IFAILR = new Int32Array( N );
	var M = [ 0 ];
	var res;
	var tc = findCase( name );
	var col;
	var key;

	res = zhsein( 'right', 'no', 'no', SELECT, 1, 0, N, H, 1, ld, 0, w, 1, 0,
		VL, 1, ld, 0, VR, 1, ld, 0, N, M, WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );

	assert.equal( getInfo( res ), tc.info, name + ':info' );
	if ( tc.m !== undefined ) {
		assert.equal( ( res.m === undefined ) ? M[ 0 ] : res.m, tc.m, name + ':m' );
	}
	for ( col = 0; col < N; col++ ) {
		key = 'vr' + ( col + 1 );
		if ( tc[ key ] ) {
			compareColumn( VR, ld, col, tc[ key ], N, name + '.' + key, 1e-9 );
		}
	}
}

function runLeft( name, N, H, w, SELECT ) {
	var ld = N;
	var VL = new Complex128Array( ld * N );
	var VR = new Complex128Array( ld * N );
	var WORK = new Complex128Array( N * N );
	var RWORK = new Float64Array( N );
	var IFAILL = new Int32Array( N );
	var IFAILR = new Int32Array( N );
	var M = [ 0 ];
	var res;
	var tc = findCase( name );
	var col;
	var key;

	res = zhsein( 'left', 'no', 'no', SELECT, 1, 0, N, H, 1, ld, 0, w, 1, 0,
		VL, 1, ld, 0, VR, 1, ld, 0, N, M, WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );

	assert.equal( getInfo( res ), tc.info, name + ':info' );
	for ( col = 0; col < N; col++ ) {
		key = 'vl' + ( col + 1 );
		if ( tc[ key ] ) {
			compareColumn( VL, ld, col, tc[ key ], N, name + '.' + key, 1e-9 );
		}
	}
}

// Bypass wrapper for 'both' since isOperationSide rejects it.
function runBoth( name, N, H, w, SELECT, eigsrc ) {
	var ld = N;
	var VL = new Complex128Array( ld * N );
	var VR = new Complex128Array( ld * N );
	var WORK = new Complex128Array( N * N );
	var RWORK = new Float64Array( N );
	var IFAILL = new Int32Array( N );
	var IFAILR = new Int32Array( N );
	var M = [ 0 ];
	var res;
	var tc = findCase( name );
	var col;
	var key;

	res = zhseinBase( 'both', eigsrc || 'no', 'no', SELECT, 1, 0, N, H, 1, ld, 0, w, 1, 0,
		VL, 1, ld, 0, VR, 1, ld, 0, N, M, WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );

	assert.equal( res.info, tc.info, name + ':info' );
	for ( col = 0; col < N; col++ ) {
		key = 'vr' + ( col + 1 );
		if ( tc[ key ] ) {
			compareColumn( VR, ld, col, tc[ key ], N, name + '.' + key, 1e-9 );
		}
		key = 'vl' + ( col + 1 );
		if ( tc[ key ] ) {
			compareColumn( VL, ld, col, tc[ key ], N, name + '.' + key, 1e-9 );
		}
	}
}

// Common 3x3 from Fortran tests 1+2
function mkH3() {
	return buildH( 3, 3, [
		[ 1, 1, 2.0, 1.0 ], [ 1, 2, 1.0, 0.5 ], [ 1, 3, 0.5, 0.0 ],
		[ 2, 1, 0.1, 0.0 ], [ 2, 2, 3.0, 0.0 ], [ 2, 3, 1.0, -1.0 ],
		[ 3, 2, 0.05, 0.0 ], [ 3, 3, 4.0, -1.0 ]
	]);
}

function mkW3() {
	return buildW( [ [ 2.0, 1.0 ], [ 3.0, 0.0 ], [ 4.0, -1.0 ] ] );
}


// TESTS //

test( 'zhsein: main export is a function', function t() {
	assert.strictEqual( typeof zhsein, 'function', 'is a function' );
});

test( 'zhsein: right_all_3x3 (SIDE=right)', function t() {
	runRight( 'right_all_3x3', 3, mkH3(), mkW3(), makeSel( 3, [ 1, 2, 3 ] ) );
});

test( 'zhsein: left_all_3x3 (SIDE=left)', function t() {
	runLeft( 'left_all_3x3', 3, mkH3(), mkW3(), makeSel( 3, [ 1, 2, 3 ] ) );
});

test( 'zhsein: both_4x4 (SIDE=both via base)', function t() {
	var H = buildH( 4, 4, [
		[ 1, 1, 1.0, 0.5 ], [ 1, 2, 0.5, 0.0 ], [ 1, 3, 0.2, 0.1 ], [ 1, 4, 0.1, 0.0 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 2.0, -0.5 ], [ 2, 3, 0.8, 0.2 ], [ 2, 4, 0.3, 0.1 ],
		[ 3, 2, 0.2, 0.0 ], [ 3, 3, 3.0, 1.0 ], [ 3, 4, 0.7, -0.3 ],
		[ 4, 3, 0.15, 0.0 ], [ 4, 4, 4.0, 0.5 ]
	]);
	var w = buildW( [ [ 1.0, 0.5 ], [ 2.0, -0.5 ], [ 3.0, 1.0 ], [ 4.0, 0.5 ] ] );
	runBoth( 'both_4x4', 4, H, w, makeSel( 4, [ 1, 2, 3, 4 ] ), 'no' );
});

test( 'zhsein: right_selective_5x5', function t() {
	var H = buildH( 5, 5, [
		[ 1, 1, 1, 0 ], [ 1, 2, 2, 0 ], [ 1, 3, 1, 0 ], [ 1, 4, 3, 0 ], [ 1, 5, 0.5, 0 ],
		[ 2, 2, 2, 1 ], [ 2, 3, 1.5, 0 ], [ 2, 4, 1, 0 ], [ 2, 5, 0.5, 0 ],
		[ 3, 3, 3, -1 ], [ 3, 4, 2, 0 ], [ 3, 5, 1, 0 ],
		[ 4, 4, 4, 0.5 ], [ 4, 5, 1, 0 ],
		[ 5, 5, 5, -0.5 ]
	]);
	var w = buildW( [ [ 1, 0 ], [ 2, 1 ], [ 3, -1 ], [ 4, 0.5 ], [ 5, -0.5 ] ] );
	runRight( 'right_selective_5x5', 5, H, w, makeSel( 5, [ 1, 3 ] ) );
});

test( 'zhsein: n1_both (1x1, SIDE=both via base)', function t() {
	var H = buildH( 1, 1, [ [ 1, 1, 3.5, -1.2 ] ] );
	var w = buildW( [ [ 3.5, -1.2 ] ] );
	runBoth( 'n1_both', 1, H, w, makeSel( 1, [ 1 ] ), 'no' );
});

test( 'zhsein: both_fromqr_block_5x5 (eigsrc=qr)', function t() {
	var H = buildH( 5, 5, [
		[ 1, 1, 2.0, 0.5 ], [ 1, 2, 1.0, 0.0 ], [ 1, 3, 0.5, 0.1 ], [ 1, 4, 0.2, 0.0 ], [ 1, 5, 0.1, 0.0 ],
		[ 2, 1, 0.3, 0.0 ], [ 2, 2, 3.0, -0.5 ], [ 2, 3, 1.0, 0.2 ], [ 2, 4, 0.3, 0.0 ], [ 2, 5, 0.2, 0.0 ],
		[ 3, 2, 0.2, 0.0 ], [ 3, 3, 4.0, 1.0 ], [ 3, 4, 0.4, 0.0 ], [ 3, 5, 0.3, 0.0 ],
		[ 4, 4, 5.0, -1.0 ], [ 4, 5, 1.0, 0.5 ],
		[ 5, 4, 0.3, 0.0 ], [ 5, 5, 6.0, 0.5 ]
	]);
	var w = buildW( [ [ 2.0, 0.5 ], [ 3.0, -0.5 ], [ 4.0, 1.0 ], [ 5.0, -1.0 ], [ 6.0, 0.5 ] ] );
	runBoth( 'both_fromqr_block_5x5', 5, H, w, makeSel( 5, [ 1, 2, 3, 4, 5 ] ), 'qr' );
});

test( 'zhsein: throws TypeError for invalid side via wrapper', function t() {
	assert.throws( function throws() {
		zhsein( 'bogus', 'no', 'no', new Uint8Array( 1 ), 1, 0, 1,
			new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0,
			new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0,
			1, [ 0 ], new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0,
			new Int32Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zhsein: invalid eigsrc returns -2 via base', function t() {
	var sel = new Uint8Array( 1 );
	var H = new Complex128Array( 1 );
	var w = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var VR = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var res = zhseinBase( 'right', 'bogus', 'no', sel, 1, 0, 1, H, 1, 1, 0, w, 1, 0,
		VL, 1, 1, 0, VR, 1, 1, 0, 1, [ 0 ], WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, -2, 'info=-2' );
});

test( 'zhsein: invalid initv returns -3 via base', function t() {
	var sel = new Uint8Array( 1 );
	var H = new Complex128Array( 1 );
	var w = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var VR = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var res = zhseinBase( 'right', 'no', 'bogus', sel, 1, 0, 1, H, 1, 1, 0, w, 1, 0,
		VL, 1, 1, 0, VR, 1, 1, 0, 1, [ 0 ], WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, -3, 'info=-3' );
});

test( 'zhsein: negative N returns -5 via base', function t() {
	var sel = new Uint8Array( 1 );
	var H = new Complex128Array( 1 );
	var w = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var VR = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var res = zhseinBase( 'right', 'no', 'no', sel, 1, 0, -1, H, 1, 1, 0, w, 1, 0,
		VL, 1, 1, 0, VR, 1, 1, 0, 1, [ 0 ], WORK, 1, 0, RWORK, 1, 0,
		IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( res.info, -5, 'info=-5' );
});
