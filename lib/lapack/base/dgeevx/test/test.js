
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeevx from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgeevx, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dgeevx.ndarray, 'function', 'has ndarray method' );
});

test( 'main export computes eigenvalues of a diagonal matrix', function t() {
	var A = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
	var WR = new Float64Array( 3 );
	var WI = new Float64Array( 3 );
	var VL = new Float64Array( 9 );
	var VR = new Float64Array( 9 );
	var SCALE = new Float64Array( 3 );
	var RCONDE = new Float64Array( 3 );
	var RCONDV = new Float64Array( 3 );
	var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', 3, A, 3, WR, 1, WI, 1, VL, 3, VR, 3, SCALE, RCONDE, RCONDV ); // eslint-disable-line max-len
	assert.equal( out.info, 0, 'info should be 0' );
	assert.ok( typeof out.ilo === 'number', 'ilo present' );
	assert.ok( typeof out.ihi === 'number', 'ihi present' );
	assert.ok( typeof out.abnrm === 'number', 'abnrm present' );
});
