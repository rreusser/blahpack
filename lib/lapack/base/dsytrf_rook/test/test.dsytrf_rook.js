/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrfRook from './../lib/dsytrf_rook.js';


// TESTS //

test( 'dsytrf_rook is a function', function t() {
	assert.strictEqual( typeof dsytrfRook, 'function', 'is a function' );
});

test( 'dsytrf_rook has expected arity', function t() {
	assert.strictEqual( dsytrfRook.length, 7, 'has expected arity' );
});

test( 'dsytrf_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrfRook( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsytrf_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrfRook( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsytrf_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrfRook( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsytrf_rook throws RangeError for too-small LDA', function t() {
	assert.throws( function throws() {
		dsytrfRook( 'row-major', 'upper', 4, new Float64Array( 16 ), 1, new Int32Array( 4 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsytrf_rook returns 0 for N=0', function t() {
	var info = dsytrfRook( 'column-major', 'upper', 0, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'returns 0' );
});

test( 'dsytrf_rook column-major basic 2x2', function t() {
	var IPIV;
	var info;
	var A;
	IPIV = new Int32Array( 2 );
	A = new Float64Array( [ 4.0, 1.0, 1.0, 3.0 ] );
	info = dsytrfRook( 'column-major', 'lower', 2, A, 2, IPIV, 1 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dsytrf_rook row-major basic 2x2 (transposes via swapped strides)', function t() {
	var IPIV;
	var info;
	var A;
	IPIV = new Int32Array( 2 );
	A = new Float64Array( [ 4.0, 1.0, 1.0, 3.0 ] );
	info = dsytrfRook( 'row-major', 'lower', 2, A, 2, IPIV, 1 );
	assert.strictEqual( info, 0, 'info' );
});
