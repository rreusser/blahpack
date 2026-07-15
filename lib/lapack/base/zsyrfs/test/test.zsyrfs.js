/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyrfs from './../lib/zsyrfs.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'zsyrfs is a function', function t() {
	assert.strictEqual( typeof zsyrfs, 'function', 'is a function' );
});

test( 'zsyrfs has expected arity', function t() {
	assert.strictEqual( zsyrfs.length, 21, 'has expected arity' );
});

test( 'zsyrfs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyrfs( 'invalid', 4, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 4 ), 4, new Complex128Array( 4 ), 4, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, 1, null, 1 );
	}, TypeError );
});

test( 'zsyrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyrfs( 'upper', -1, 1, new Complex128Array( 16 ), 4, new Complex128Array( 16 ), 4, new Int32Array( 4 ), 1, new Complex128Array( 4 ), 4, new Complex128Array( 4 ), 4, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, null, 1, null, 1 );
	}, RangeError );
});

test( 'zsyrfs allocates workspace when WORK/RWORK are null', function t() {
	var tc = upper_4x4;
	var n = 4;
	var A = new Complex128Array( new Float64Array( tc.A ) );
	var AF = new Complex128Array( new Float64Array( tc.AF ) );
	var IPIV = new Int32Array( tc.ipiv.map( function sub( v ) { return v - 1; } ) );
	var B = new Complex128Array( new Float64Array( tc.B ) );
	var X = new Complex128Array( new Float64Array( tc.Xinit ) );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var Xv;
	var info;
	var i;

	info = zsyrfs( 'upper', n, 1, A, n, AF, n, IPIV, 1, B, n, X, n, FERR, 1, BERR, 1, null, 1, null, 1 );
	assert.strictEqual( info, tc.info, 'info' );

	Xv = reinterpret( X, 0 );
	for ( i = 0; i < 2 * n; i++ ) {
		assertClose( Xv[ i ], tc.X[ i ], 1e-12, 'X[' + i + ']' );
	}
	assert.ok( BERR[ 0 ] < 1e-14, 'berr small: ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] < 1e-12, 'ferr small: ' + FERR[ 0 ] );
});
