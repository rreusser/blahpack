/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ztgsna from './../lib/ztgsna.js';


// TESTS //

test( 'ztgsna is a function', function t() {
	assert.strictEqual( typeof ztgsna, 'function', 'is a function' );
} );

test( 'ztgsna has expected arity', function t() {
	assert.strictEqual( ztgsna.length, 26, 'has expected arity' );
} );

test( 'ztgsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztgsna( 'invalid', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, TypeError );
} );

test( 'ztgsna throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'invalid', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, TypeError );
} );

test( 'ztgsna throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'invalid', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, TypeError );
} );

test( 'ztgsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, -1, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDA < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDA < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDB < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDB < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDVL < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna throws RangeError for LDVR < M (column-major)', function t() {
	assert.throws( function throws() {
		ztgsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, 2, new Complex128Array( 4 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	}, RangeError );
} );

test( 'ztgsna: column-major path runs (1x1)', function t() {
	var A = new Complex128Array( [ 3.0, 0.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var DIF = new Float64Array( 1 );
	var WORK = new Complex128Array( 1 );
	var IWORK = new Int32Array( 1 );
	var res = ztgsna( 'column-major', 'both', 'all', SELECT, 1, 1, A, 1, B, 1, VL, 1, VR, 1, s, 1, DIF, 1, 1, 1, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( res.info, 0, 'info=0' );
	assert.equal( res.m, 1, 'm=1' );
} );

test( 'ztgsna: row-major path runs (1x1)', function t() {
	var A = new Complex128Array( [ 3.0, 0.0 ] );
	var B = new Complex128Array( [ 1.0, 0.0 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var DIF = new Float64Array( 1 );
	var WORK = new Complex128Array( 1 );
	var IWORK = new Int32Array( 1 );
	var res = ztgsna( 'row-major', 'both', 'all', SELECT, 1, 1, A, 1, B, 1, VL, 1, VR, 1, s, 1, DIF, 1, 1, 1, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( res.info, 0, 'info=0' );
	assert.equal( res.m, 1, 'm=1' );
} );
