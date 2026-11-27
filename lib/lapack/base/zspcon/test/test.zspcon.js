/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zspcon from './../lib/zspcon.js';

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsptrf from './../../zsptrf/lib/ndarray.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zspcon is a function', function t() {
	assert.strictEqual( typeof zspcon, 'function', 'is a function' );
});

test( 'zspcon has expected arity', function t() {
	assert.strictEqual( zspcon.length, 9, 'has expected arity' );
});

test( 'zspcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspcon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zspcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspcon( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zspcon throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		zspcon( 'row-major', 'upper', 2, new Complex128Array( 3 ), new Int32Array( 2 ), 1, 2, new Float64Array( 1 ), new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'zspcon throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zspcon( 'invalid', 'upper', 2, new Complex128Array( 3 ), new Int32Array( 2 ), 1, 2, new Float64Array( 1 ), new Complex128Array( 4 ) );
	}, TypeError );
});

test( 'zspcon throws RangeError for negative anorm', function t() {
	assert.throws( function throws() {
		zspcon( 'column-major', 'upper', 2, new Complex128Array( 3 ), new Int32Array( 2 ), 1, -1, new Float64Array( 1 ), new Complex128Array( 4 ) );
	}, RangeError );
});

test( 'zspcon (column-major) matches ndarray, with and without workspace', function t() {
	const uplos = [ 'upper', 'lower' ];
	let rcondW, rcondN, rcondE, IPIV, info, AP, u;
	for ( u = 0; u < uplos.length; u++ ) {
		// Complex symmetric 3x3 matrix in packed storage:
		AP = new Complex128Array( [ 2, 1, 1, 1, 4, -1, 3, -2, 2, 1, 5, 3 ] );
		IPIV = new Int32Array( 3 );
		zsptrf( uplos[ u ], 3, AP, 1, 0, IPIV, 1, 0 );
		rcondE = new Float64Array( 1 );
		info = ndarray( uplos[ u ], 3, AP, 1, 0, IPIV, 1, 0, 12.0, rcondE, new Complex128Array( 6 ), 1, 0 );
		assert.equal( info, 0 );
		assert.ok( rcondE[ 0 ] > 0.0 && rcondE[ 0 ] <= 1.0, 'rcond in (0,1]' );
		rcondW = new Float64Array( 1 );
		info = zspcon( 'column-major', uplos[ u ], 3, AP, IPIV, 1, 12.0, rcondW, new Complex128Array( 6 ) );
		assert.equal( info, 0 );
		assert.equal( rcondW[ 0 ], rcondE[ 0 ], uplos[ u ] + ': explicit workspace' );
		rcondN = new Float64Array( 1 );
		info = zspcon( 'column-major', uplos[ u ], 3, AP, IPIV, 1, 12.0, rcondN, null );
		assert.equal( info, 0 );
		assert.equal( rcondN[ 0 ], rcondE[ 0 ], uplos[ u ] + ': null workspace' );
	}
});
