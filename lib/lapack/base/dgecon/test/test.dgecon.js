/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from './../../dgetrf/lib/ndarray.js';
import dgecon from './../lib/dgecon.js';


// TESTS //

test( 'dgecon is a function', function t() {
	assert.strictEqual( typeof dgecon, 'function', 'is a function' );
});

test( 'dgecon has expected arity', function t() {
	assert.strictEqual( dgecon.length, 11, 'has expected arity' );
});

test( 'dgecon throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgecon( 'invalid', 'one-norm', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgecon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgecon( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgecon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgecon( 'row-major', 'one-norm', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgecon throws RangeError for LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dgecon( 'column-major', 'one-norm', 3, new Float64Array( 9 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 12 ), 1, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgecon: row-major identity 3x3', function t() {
	var N = 3;
	var A = new Float64Array( [
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	] );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	// Factor as column-major (identity is symmetric so order doesn't change result)
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'row-major', 'one-norm', N, A, N, 1.0, rcond, work, 1, iwork, 1 );
	assert.strictEqual( info, 0 );
});

test( 'dgecon: column-major identity 3x3', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'column-major', 'one-norm', N, A, N, 1.0, rcond, work, 1, iwork, 1 );
	assert.strictEqual( info, 0 );
});

test( 'dgecon: column-major N=0 quick return (covers base N=0 branch)', function t() {
	var rcond = new Float64Array( 1 );
	var info = dgecon( 'column-major', 'one-norm', 0, new Float64Array( 0 ), 1, 0.0, rcond, new Float64Array( 0 ), 1, new Int32Array( 0 ), 1 );
	// Wrapper doesn't shortcut N=0 — calls base which sets rcond=1
	assert.strictEqual( info, 0 );
});
