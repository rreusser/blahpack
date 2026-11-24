/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstein from './../lib/dstein.js';


// TESTS //

test( 'dstein is a function', function t() {
	assert.strictEqual( typeof dstein, 'function', 'is a function' );
});

test( 'dstein has expected arity', function t() {
	assert.strictEqual( dstein.length, 19, 'has expected arity' );
});

test( 'dstein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstein( 'column-major', -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstein throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dstein( 'column-major', new Float64Array( 4 ), 2, 1, 2, 1, -1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstein allocates WORK and IWORK when they are null', function t() {
	// T = tridiag(1, 2, 1) of order 3 with its exact eigenvalues.
	const dv = [ 2.0, 2.0, 2.0 ];
	const ev = [ 1.0, 1.0 ];
	const w = new Float64Array( [ 2.0 - Math.SQRT2, 2.0, 2.0 + Math.SQRT2 ] );
	const IFAIL = new Int32Array( 3 );
	const Z = new Float64Array( 9 );
	let nrm;
	let s;
	let i;
	let j;
	const info = dstein( 'column-major', 3, new Float64Array( dv ), 1, new Float64Array( ev ), 1, 3, w, 1, new Int32Array( [ 1, 1, 1 ] ), 1, new Int32Array( [ 3 ] ), 1, Z, 3, null, null, IFAIL, 1 );
	assert.strictEqual( info, 0 );
	assert.deepStrictEqual( Array.from( IFAIL ), [ 0, 0, 0 ] );
	for ( j = 0; j < 3; j++ ) {
		nrm = 0.0;
		for ( i = 0; i < 3; i++ ) {
			s = ( dv[ i ] - w[ j ] ) * Z[ ( ( j * 3 ) + i ) ];
			if ( i > 0 ) {
				s += ev[ i - 1 ] * Z[ ( ( j * 3 ) + i - 1 ) ];
			}
			if ( i < 2 ) {
				s += ev[ i ] * Z[ ( ( j * 3 ) + i + 1 ) ];
			}
			assert.ok( Math.abs( s ) <= 1e-14, 'residual (' + i + ',' + j + ')' );
			nrm += Z[ ( ( j * 3 ) + i ) ] * Z[ ( ( j * 3 ) + i ) ];
		}
		assert.ok( Math.abs( nrm - 1.0 ) <= 1e-14, 'unit norm' );
	}
});
