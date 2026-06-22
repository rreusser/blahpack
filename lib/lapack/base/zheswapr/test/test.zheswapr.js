/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zheswapr from './../lib/zheswapr.js';


// VARIABLES //

var N = 3;
var LDA = 3;


// FUNCTIONS //

/**
* Builds a small 3x3 Hermitian matrix (column-major).
*
* @private
* @returns {Complex128Array} Hermitian matrix
*/
function buildSmall() {
	var buf;
	var idx;
	var re;
	var im;
	var i;
	var j;
	buf = new Float64Array( 2 * LDA * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			idx = 2 * ( ( ( j - 1 ) * LDA ) + ( i - 1 ) );
			if ( i === j ) {
				re = ( 10 * i ) + 1;
				im = 0;
			} else if ( i < j ) {
				re = ( 10 * i ) + j;
				im = i + j;
			} else {
				re = ( 10 * j ) + i;
				im = -( i + j );
			}
			buf[ idx ] = re;
			buf[ idx + 1 ] = im;
		}
	}
	return new Complex128Array( buf.buffer );
}


// TESTS //

test( 'zheswapr is a function', function t() {
	assert.strictEqual( typeof zheswapr, 'function', 'is a function' );
});

test( 'zheswapr has expected arity', function t() {
	assert.strictEqual( zheswapr.length, 7, 'has expected arity' );
});

test( 'zheswapr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zheswapr( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, 0, 1 );
	}, TypeError );
});

test( 'zheswapr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheswapr( 'column-major', 'invalid', 2, new Complex128Array( 4 ), 2, 0, 1 );
	}, TypeError );
});

test( 'zheswapr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheswapr( 'column-major', 'upper', -1, new Complex128Array( 4 ), 2, 0, 1 );
	}, RangeError );
});

test( 'zheswapr throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		zheswapr( 'column-major', 'upper', 4, new Complex128Array( 16 ), 2, 0, 1 );
	}, RangeError );
});

test( 'zheswapr column-major: returns input matrix', function t() {
	var out;
	var A;
	A = buildSmall();
	out = zheswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
	assert.strictEqual( out, A );
});

test( 'zheswapr row-major: returns input matrix', function t() {
	var out;
	var A;
	A = buildSmall();
	out = zheswapr( 'row-major', 'lower', 3, A, 3, 0, 2 );
	assert.strictEqual( out, A );
});
