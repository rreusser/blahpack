/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspcon from './../lib/dspcon.js';

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from './../../dsptrf/lib/ndarray.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dspcon is a function', function t() {
	assert.strictEqual( typeof dspcon, 'function', 'is a function' );
});

test( 'dspcon has expected arity', function t() {
	assert.strictEqual( dspcon.length, 10, 'has expected arity' );
});

test( 'dspcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspcon( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dspcon throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		dspcon( 'row-major', 'upper', 2, new Float64Array( 3 ), new Int32Array( 2 ), 1, 2, new Float64Array( 1 ), new Float64Array( 4 ), new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dspcon throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspcon( 'invalid', 'upper', 2, new Float64Array( 3 ), new Int32Array( 2 ), 1, 2, new Float64Array( 1 ), new Float64Array( 4 ), new Int32Array( 2 ) );
	}, TypeError );
});

test( 'dspcon throws RangeError for negative anorm', function t() {
	assert.throws( function throws() {
		dspcon( 'column-major', 'upper', 2, new Float64Array( 3 ), new Int32Array( 2 ), 1, -1, new Float64Array( 1 ), new Float64Array( 4 ), new Int32Array( 2 ) );
	}, RangeError );
});

test( 'dspcon (column-major) matches ndarray, with and without workspace', function t() {
	const uplos = [ 'upper', 'lower' ];
	let rcondW, rcondN, rcondE, IPIV, info, AP, u;
	for ( u = 0; u < uplos.length; u++ ) {
		// Symmetric indefinite 4x4 matrix in packed storage (same values work for both triangles):
		AP = new Float64Array( [ 1, -2, 0, 3, 1, 4, -1, 2, 5, 2 ] );
		IPIV = new Int32Array( 4 );
		dsptrf( uplos[ u ], 4, AP, 1, 0, IPIV, 1, 0 );
		rcondE = new Float64Array( 1 );
		info = ndarray( uplos[ u ], 4, AP, 1, 0, IPIV, 1, 0, 9.0, rcondE, new Float64Array( 8 ), 1, 0, new Int32Array( 4 ), 1, 0 );
		assert.equal( info, 0 );
		assert.ok( rcondE[ 0 ] > 0.0 && rcondE[ 0 ] <= 1.0, 'rcond in (0,1]' );
		rcondW = new Float64Array( 1 );
		info = dspcon( 'column-major', uplos[ u ], 4, AP, IPIV, 1, 9.0, rcondW, new Float64Array( 8 ), new Int32Array( 4 ) );
		assert.equal( info, 0 );
		assert.equal( rcondW[ 0 ], rcondE[ 0 ], uplos[ u ] + ': explicit workspace' );
		rcondN = new Float64Array( 1 );
		info = dspcon( 'column-major', uplos[ u ], 4, AP, IPIV, 1, 9.0, rcondN, null, null );
		assert.equal( info, 0 );
		assert.equal( rcondN[ 0 ], rcondE[ 0 ], uplos[ u ] + ': null workspace' );
	}
});
