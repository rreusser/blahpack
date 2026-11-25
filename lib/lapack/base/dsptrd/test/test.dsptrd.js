/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsptrd from './../lib/dsptrd.js';
import dsptrdNd from './../lib/ndarray.js';


// TESTS //

test( 'dsptrd is a function', function t() {
	assert.strictEqual( typeof dsptrd, 'function', 'is a function' );
});

test( 'dsptrd has expected arity', function t() {
	assert.strictEqual( dsptrd.length, 10, 'has expected arity' );
});

test( 'dsptrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptrd( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsptrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptrd( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dsptrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsptrd( 'invalid', 'upper', 2, new Float64Array( 3 ), new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dsptrd throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dsptrd( 'row-major', 'upper', 2, new Float64Array( 3 ), new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dsptrd (column-major) matches ndarray for both triangles and positive/negative strides', function t() {
	// Packed 4x4 symmetric matrix (upper and lower packings of the same matrix):
	const apUpper = [ 4.0, 1.0, 3.0, -2.0, 0.5, 5.0, 1.5, -1.0, 2.0, 6.0 ];
	const apLower = [ 4.0, 1.0, -2.0, 1.5, 3.0, 0.5, -1.0, 5.0, 2.0, 6.0 ];
	const cases = [
		[ 'upper', apUpper, 1 ], [ 'lower', apLower, 1 ], [ 'upper', apUpper, -1 ], [ 'lower', apLower, 2 ]
	];
	let TAUe;
	let TAUa;
	let APe;
	let APa;
	let de;
	let da;
	let ee;
	let ea;
	let tr;
	let s;
	let N;
	let i;
	let k;
	N = 4;
	for ( k = 0; k < cases.length; k += 1 ) {
		s = cases[ k ][ 2 ];
		APa = new Float64Array( cases[ k ][ 1 ] );
		APe = new Float64Array( cases[ k ][ 1 ] );
		da = new Float64Array( N * 2 );
		de = new Float64Array( N * 2 );
		ea = new Float64Array( N * 2 );
		ee = new Float64Array( N * 2 );
		TAUa = new Float64Array( N * 2 );
		TAUe = new Float64Array( N * 2 );
		assert.strictEqual( dsptrd( 'column-major', cases[ k ][ 0 ], N, APa, da, s, ea, s, TAUa, s ), 0 );
		assert.strictEqual( dsptrdNd( cases[ k ][ 0 ], N, APe, 1, 0, de, s, ( s < 0 ) ? ( 1 - N ) * s : 0, ee, s, ( s < 0 ) ? ( 2 - N ) * s : 0, TAUe, s, ( s < 0 ) ? ( 2 - N ) * s : 0 ), 0 );
		for ( i = 0; i < APe.length; i += 1 ) {
			assert.strictEqual( APa[ i ], APe[ i ], cases[ k ][ 0 ] + ' AP[' + i + ']' );
		}
		for ( i = 0; i < de.length; i += 1 ) {
			assert.strictEqual( da[ i ], de[ i ], cases[ k ][ 0 ] + ' d[' + i + ']' );
			assert.strictEqual( ea[ i ], ee[ i ], cases[ k ][ 0 ] + ' e[' + i + ']' );
			assert.strictEqual( TAUa[ i ], TAUe[ i ], cases[ k ][ 0 ] + ' TAU[' + i + ']' );
		}
		// Similarity transform preserves the trace: sum(d) = trace(A) = 18.
		tr = 0.0;
		for ( i = 0; i < N; i += 1 ) {
			tr += da[ i * Math.abs( s ) ];
		}
		assert.ok( Math.abs( tr - 18.0 ) < 1e-12, 'trace preserved: ' + tr );
	}
});
