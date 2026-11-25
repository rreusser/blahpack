/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr from './../lib/dspr.js';

import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dspr is a function', function t() {
	assert.strictEqual( typeof dspr, 'function', 'is a function' );
});

test( 'dspr has expected arity', function t() {
	assert.strictEqual( dspr.length, 7, 'has expected arity' );
});

test( 'dspr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspr( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspr( 'column-major', 'upper', -1, 2, 2, 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dspr throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		dspr( 'row-major', 'upper', 2, 1.0, new Float64Array( 2 ), 1, new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspr( 'invalid', 'upper', 2, 1.0, new Float64Array( 2 ), 1, new Float64Array( 3 ) );
	}, TypeError );
});

test( 'dspr throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		dspr( 'column-major', 'upper', 2, 1.0, new Float64Array( 2 ), 0, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dspr (column-major) matches ndarray, including negative strides', function t() {
	const strides = [ 1, 2, -1, -2 ];
	const uplos = [ 'upper', 'lower' ];
	let APe, APw, sx, ox, x, u, s, i;
	for ( u = 0; u < uplos.length; u++ ) {
		for ( s = 0; s < strides.length; s++ ) {
			sx = strides[ s ];
			x = new Float64Array( [ 1, -2, 3, 0.5, -1, 4 ] );
			APe = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
			APw = new Float64Array( APe );
			ox = ( sx < 0 ) ? -2 * sx : 0;
			ndarray( uplos[ u ], 3, 1.5, x, sx, ox, APe, 1, 0 );
			dspr( 'column-major', uplos[ u ], 3, 1.5, x, sx, APw );
			for ( i = 0; i < APe.length; i++ ) {
				assert.equal( APw[ i ], APe[ i ], uplos[ u ] + ' stride ' + sx + ' AP[' + i + ']' );
			}
		}
	}
});
