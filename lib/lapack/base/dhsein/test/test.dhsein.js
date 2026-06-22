/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dhsein from './../lib/dhsein.js';


// FUNCTIONS //

function bufF( n ) {
	return new Float64Array( n );
}

function bufI( n ) {
	return new Int32Array( n );
}

function bufS( n ) {
	return new Uint8Array( n );
}


// TESTS //

test( 'dhsein is a function', function t() {
	assert.strictEqual( typeof dhsein, 'function', 'is a function' );
} );

test( 'dhsein has expected arity', function t() {
	assert.strictEqual( dhsein.length, 27, 'has expected arity' );
} );

test( 'dhsein throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dhsein( 'invalid', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, TypeError );
} );

test( 'dhsein throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'invalid', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, TypeError );
} );

test( 'dhsein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, -1, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, -1, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDH < N (row-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 0, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDH < M (column-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'column-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 0, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 0, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDVL < M (column-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'column-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 0, bufF( 4 ), 2, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'row-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 0, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein throws RangeError for LDVR < M (column-major)', function t() {
	assert.throws( function throws() {
		dhsein( 'column-major', 'left', 'no-source', 'no-init', bufS( 4 ), 1, 2, bufF( 4 ), 2, bufF( 2 ), 1, bufF( 2 ), 1, bufF( 4 ), 2, bufF( 4 ), 0, 2, 2, bufF( 16 ), 1, bufI( 2 ), 1, 0, bufI( 2 ), 1, 0 );
	}, RangeError );
} );

test( 'dhsein: column-major path runs (1x1)', function t() {
	var H = new Float64Array( [ 3.5 ] );
	var WR = new Float64Array( [ 3.5 ] );
	var WI = new Float64Array( [ 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var WORK = new Float64Array( 3 );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var info = dhsein( 'column-major', 'right', 'no-source', 'no-init', SELECT, 1, 1, H, 1, WR, 1, WI, 1, VL, 1, VR, 1, 1, 1, WORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( info.info, 0, 'info=0' );
	assert.equal( info.m, 1, 'm=1' );
} );

test( 'dhsein: row-major path runs (1x1)', function t() {
	var H = new Float64Array( [ 3.5 ] );
	var WR = new Float64Array( [ 3.5 ] );
	var WI = new Float64Array( [ 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var WORK = new Float64Array( 3 );
	var IFAILL = new Int32Array( 1 );
	var IFAILR = new Int32Array( 1 );
	var info = dhsein( 'row-major', 'right', 'no-source', 'no-init', SELECT, 1, 1, H, 1, WR, 1, WI, 1, VL, 1, VR, 1, 1, 1, WORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );
	assert.equal( info.info, 0, 'info=0' );
	assert.equal( info.m, 1, 'm=1' );
} );
