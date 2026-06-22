// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyrfs from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function toF64( cArr, n ) {
	return Array.prototype.slice.call( reinterpret( cArr, 0 ), 0, n );
}

// TESTS //

test( 'zsyrfs: upper 4x4', function t() {
	var tc = upper_4x4;
	var n = 4;
	var A = new Complex128Array( new Float64Array( tc.A ) );
	var AF = new Complex128Array( new Float64Array( tc.AF ) );
	// Fortran IPIV is 1-based, convert to 0-based
	var IPIV = new Int32Array( tc.ipiv.map( function sub( v ) { return v - 1; } ) );
	var B = new Complex128Array( new Float64Array( tc.B ) );
	var X = new Complex128Array( new Float64Array( tc.Xinit ) );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( n );
	var RWORK = new Float64Array( n );

	var info = zsyrfs(
		'upper', n, 1,
		A, 1, n, 0,
		AF, 1, n, 0,
		IPIV, 1, 0,
		B, 1, n, 0,
		X, 1, n, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( X, 2 * n ), tc.X, 1e-12, 'X' );
	// BERR and FERR are estimates, check order of magnitude
	assert.ok( BERR[ 0 ] < 1e-14, 'berr small: ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] < 1e-12, 'ferr small: ' + FERR[ 0 ] );
});

test( 'zsyrfs: lower 4x4', function t() {
	var tc = lower_4x4;
	var n = 4;
	var A = new Complex128Array( new Float64Array( tc.A ) );
	var AF = new Complex128Array( new Float64Array( tc.AF ) );
	var IPIV = new Int32Array( tc.ipiv.map( function sub( v ) { return v - 1; } ) );
	var B = new Complex128Array( new Float64Array( tc.B ) );
	var X = new Complex128Array( new Float64Array( tc.Xinit ) );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( n );
	var RWORK = new Float64Array( n );

	var info = zsyrfs(
		'lower', n, 1,
		A, 1, n, 0,
		AF, 1, n, 0,
		IPIV, 1, 0,
		B, 1, n, 0,
		X, 1, n, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( X, 2 * n ), tc.X, 1e-12, 'X' );
	assert.ok( BERR[ 0 ] < 1e-14, 'berr small: ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] < 1e-12, 'ferr small: ' + FERR[ 0 ] );
});

test( 'zsyrfs: N=0 quick return', function t() {
	var A = new Complex128Array( 1 );
	var AF = new Complex128Array( 1 );
	var IPIV = new Int32Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );
	var FERR = new Float64Array( [ 99.0 ] );
	var BERR = new Float64Array( [ 99.0 ] );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );

	var info = zsyrfs(
		'upper', 0, 1,
		A, 1, 1, 0,
		AF, 1, 1, 0,
		IPIV, 1, 0,
		B, 1, 1, 0,
		X, 1, 1, 0,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( FERR[ 0 ], 0.0, 'ferr zeroed' );
	assert.strictEqual( BERR[ 0 ], 0.0, 'berr zeroed' );
});
