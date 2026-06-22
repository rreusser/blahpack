/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbcon from './../lib/dgbcon.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/ndarray.js';


// TESTS //

test( 'dgbcon is a function', function t() {
	assert.strictEqual( typeof dgbcon, 'function', 'is a function' );
});

test( 'dgbcon has expected arity', function t() {
	assert.strictEqual( dgbcon.length, 14, 'has expected arity' );
});

test( 'dgbcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgbcon( 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgbcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbcon( 'one-norm', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgbcon throws RangeError for LDAB < max(1,N)', function t() {
	assert.throws( function throws() {
		dgbcon( 'one-norm', 4, 1, 1, new Float64Array( 16 ), 2, new Float64Array( 4 ), 1, 1.0, new Float64Array( 1 ), new Float64Array( 12 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgbcon: full 4x4 column-major covers wrapper call path', function t() {
	var N = 4;
	var kl = N - 1; // 3
	var ku = N - 1; // 3
	var LDAB = (2 * kl) + ku + 1; // 10 >= N=4
	var AB = new Float64Array( LDAB * N );
	// dense 4x4 dominated diagonal
	var Adense = new Float64Array( N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 4.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		Adense[ (i * N) + (i + 1) ] = 1.0;
		Adense[ ((i + 1) * N) + i ] = 1.0;
	}
	for ( j = 0; j < N; j++ ) {
		var iLo = Math.max( 0, j - ku );
		var iHi = Math.min( N - 1, j + kl );
		for ( i = iLo; i <= iHi; i++ ) {
			AB[ (j * LDAB) + (kl + ku + i - j) ] = Adense[ (j * N) + i ];
		}
	}
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, LDAB, IPIV, 1, 6.0, rcond, work, 1, iwork, 1 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});
