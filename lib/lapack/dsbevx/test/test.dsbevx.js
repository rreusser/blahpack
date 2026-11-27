/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbevx from './../lib/dsbevx.js';


// TESTS //

test( 'dsbevx is a function', function t() {
	assert.strictEqual( typeof dsbevx, 'function', 'is a function' );
});

test( 'dsbevx has expected arity', function t() {
	assert.strictEqual( dsbevx.length, 24, 'has expected arity' );
});

test( 'dsbevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsbevx( 'column-major', 2, 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsbevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsbevx( 'column-major', 'no-vectors', 'all', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dsbevx: row-major matches column-major (V, I, U, KD=2, N=5), WORK and IWORK allocated when null', function t() {
	// Column-major upper band storage (LDAB = 3) of a 5x5 symmetric matrix:
	const ABc = new Float64Array( [ 0, 0, 4, 0, 1, 5, 2, 3, 6, 1, 2, 7, 1, 3, 8 ] ); // eslint-disable-line max-len
	const ABr = new Float64Array( 15 );
	const mc = new Int32Array( 1 );
	const mr = new Int32Array( 1 );
	const wc = new Float64Array( 5 );
	const wr = new Float64Array( 5 );
	const Zc = new Float64Array( 25 );
	const Zr = new Float64Array( 25 );
	const IFc = new Int32Array( 5 );
	const IFr = new Int32Array( 5 );
	let infoc;
	let infor;
	let i;
	let k;
	for ( k = 0; k < 3; k++ ) {
		for ( i = 0; i < 5; i++ ) {
			ABr[ ( k * 5 ) + i ] = ABc[ k + ( i * 3 ) ];
		}
	}
	infoc = dsbevx( 'column-major', 'compute-vectors', 'index', 'upper', 5, 2, ABc, 3, new Float64Array( 25 ), 5, 0, 0, 2, 4, 0, mc, wc, 1, Zc, 5, new Float64Array( 35 ), new Int32Array( 25 ), IFc, 1 ); // eslint-disable-line max-len
	infor = dsbevx( 'row-major', 'compute-vectors', 'index', 'upper', 5, 2, ABr, 5, new Float64Array( 25 ), 5, 0, 0, 2, 4, 0, mr, wr, 1, Zr, 5, null, null, IFr, 1 ); // eslint-disable-line max-len
	assert.equal( infoc, 0 );
	assert.equal( infor, 0 );
	assert.equal( mc[ 0 ], 3 );
	assert.equal( mr[ 0 ], 3 );
	for ( k = 0; k < 3; k++ ) {
		assert.ok( Math.abs( wr[ k ] - wc[ k ] ) <= 1e-13 * 10, 'w[' + k + ']' );
		for ( i = 0; i < 5; i++ ) {
			assert.ok( Math.abs( Zr[ ( i * 5 ) + k ] - Zc[ i + ( k * 5 ) ] ) <= 1e-13, 'Z(' + i + ',' + k + ')' ); // eslint-disable-line max-len
		}
	}
});

test( 'dsbevx throws RangeError for invalid row-major LDZ', function t() {
	const m = new Int32Array( 1 );
	assert.throws( function throws() {
		dsbevx( 'row-major', 'no-vectors', 'all', 'upper', 3, 1, new Float64Array( 6 ), 3, new Float64Array( 9 ), 3, 0, 0, 1, 1, 0, m, new Float64Array( 3 ), 1, new Float64Array( 9 ), 0, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, /Twentieth argument is invalid \(row-major/ );
	assert.throws( function throws() {
		dsbevx( 'row-major', 'compute-vectors', 'index', 'upper', 3, 1, new Float64Array( 6 ), 3, new Float64Array( 9 ), 3, 0, 0, 1, 3, 0, m, new Float64Array( 3 ), 1, new Float64Array( 9 ), 2, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		dsbevx( 'row-major', 'compute-vectors', 'all', 'upper', 3, 1, new Float64Array( 6 ), 3, new Float64Array( 9 ), 3, 0, 0, 1, 1, 0, m, new Float64Array( 3 ), 1, new Float64Array( 9 ), 2, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, /Value: `2`/ );
});
