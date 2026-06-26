/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtrevc from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtrevc, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dtrevc.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray method returns 0 for N=0', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var T;

	SELECT = new Uint8Array( 0 );
	T = new Float64Array( 0 );
	VL = new Float64Array( 0 );
	VR = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	info = dtrevc.ndarray( 'right', 'all', SELECT, 1, 0, 0, T, 1, 0, 0, VL, 1, 0, 0, VR, 1, 0, 0, 0, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0 for N=0' );
});
