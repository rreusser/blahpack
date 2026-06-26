
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggev from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dggev, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dggev.ndarray, 'function', 'has ndarray method' );
});

test( 'dggev computes correct eigenvalues for a 2x2 diagonal pair', function t() { // eslint-disable-line max-len
	var ALPHAR;
	var ALPHAI;
	var BETA;
	var info;
	var VL;
	var VR;
	var A;
	var B;

	A = new Float64Array( [ 2, 0, 0, 5 ] );
	B = new Float64Array( [ 1, 0, 0, 1 ] );
	ALPHAR = new Float64Array( 2 );
	ALPHAI = new Float64Array( 2 );
	BETA = new Float64Array( 2 );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );

	info = dggev( 'column-major', 'no-vectors', 'no-vectors', 2, A, 2, B, 2, ALPHAR, ALPHAI, BETA, VL, 1, VR, 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns zero info' );
	assert.ok( Math.abs( ( ALPHAR[ 0 ] / BETA[ 0 ] ) - 2.0 ) < 1e-12, 'first eigenvalue is 2' ); // eslint-disable-line max-len
	assert.ok( Math.abs( ( ALPHAR[ 1 ] / BETA[ 1 ] ) - 5.0 ) < 1e-12, 'second eigenvalue is 5' ); // eslint-disable-line max-len
});
