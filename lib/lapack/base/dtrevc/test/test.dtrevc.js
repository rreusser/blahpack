/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrevc from './../lib/dtrevc.js';


// TESTS //

test( 'dtrevc is a function', function t() {
	assert.strictEqual( typeof dtrevc, 'function', 'is a function' );
});

test( 'dtrevc has expected arity', function t() {
	assert.strictEqual( dtrevc.length, 16, 'has expected arity' );
});

test( 'dtrevc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrevc( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrevc throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtrevc( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtrevc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtrevc throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtrevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtrevc computes right eigenvectors (column-major)', function t() {
	var SELECT;
	var WORK;
	var info;
	var VL;
	var VR;
	var N;
	var T;

	N = 4;
	T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3; T[ 1 + 3*N ] = 0.15;
	T[ 2 + 2*N ] = 3.0; T[ 2 + 3*N ] = -0.5;
	T[ 3 + 2*N ] = 0.8; T[ 3 + 3*N ] = 3.0;
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Float64Array( N );
	WORK = new Float64Array( 3 * N );
	info = dtrevc( 'column-major', 'right', 'all', SELECT, 1, N, T, N, VL, N, VR, N, N, 0, WORK, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	assert.strictEqual( typeof VR[ 0 ], 'number', 'VR has numeric entries' );
	assert.ok( !isNaN( VR[ 0 ] ), 'VR[0] is not NaN' );
});
