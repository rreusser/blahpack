/**
* @license Apache-2.0
*
* Copyright (c) 2026 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgeevx from './../lib/dgeevx.js';


// TESTS //

test( 'dgeevx (main): computes eigenvalues of a diagonal matrix', function t() {
	var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	var WR = new Float64Array( 3 );
	var WI = new Float64Array( 3 );
	var VL = new Float64Array( 9 );
	var VR = new Float64Array( 9 );
	var SCALE = new Float64Array( 3 );
	var RCONDE = new Float64Array( 3 );
	var RCONDV = new Float64Array( 3 );
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 3, WR, 1, WI, 1, VL, 3, VR, 3, SCALE, RCONDE, RCONDV );
	assert.equal( out.info, 0 );
});

test( 'dgeevx (main): throws on invalid balanc', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'INVALID', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /balanc/ );
});

test( 'dgeevx (main): throws on invalid jobvl', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'both', 'X', 'compute-vectors', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /jobvl/ );
});

test( 'dgeevx (main): throws on invalid jobvr', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'both', 'compute-vectors', 'X', 'none', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /jobvr/ );
});

test( 'dgeevx (main): throws on invalid sense', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'X', 2, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /sense/ );
});

test( 'dgeevx (main): throws on negative N', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', -1, A, 2, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /nonnegative/ );
});

test( 'dgeevx (main): throws on small LDA', function t() {
	var A = new Float64Array( 4 );
	var WR = new Float64Array( 2 );
	var WI = new Float64Array( 2 );
	var VL = new Float64Array( 4 );
	var VR = new Float64Array( 4 );
	var SCALE = new Float64Array( 2 );
	var RCONDE = new Float64Array( 2 );
	var RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, WR, 1, WI, 1, VL, 2, VR, 2, SCALE, RCONDE, RCONDV );
	}, /Seventh/ );
});
