/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbevx from './../lib/zhbevx.js';


// TESTS //

test( 'zhbevx is a function', function t() {
	assert.strictEqual( typeof zhbevx, 'function', 'is a function' );
});

test( 'zhbevx has expected arity', function t() {
	assert.strictEqual( zhbevx.length, 25, 'has expected arity' );
});

test( 'zhbevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		zhbevx( 'column-major', 2, 2, 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhbevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		zhbevx( 'column-major', 'no-vectors', 'all', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zhbevx: row-major matches column-major (V, I, U, KD=2, N=5), WORK, RWORK and IWORK allocated when null', function t() {
	// Column-major upper band storage (LDAB = 3) of a 5x5 Hermitian matrix:
	const ABc = new Complex128Array( [ 0, 0, 0, 0, 4, 0, 0, 0, 1, 1, 5, 0, 2, -1, 3, 1, 6, 0, 1, -1, 2, 1, 7, 0, 1, -1, 3, 1, 8, 0 ] ); // eslint-disable-line max-len
	const ABcv = reinterpret( ABc, 0 );
	const ABr = new Complex128Array( 15 );
	const ABrv = reinterpret( ABr, 0 );
	const mc = new Int32Array( 1 );
	const mr = new Int32Array( 1 );
	const wc = new Float64Array( 5 );
	const wr = new Float64Array( 5 );
	const Zc = new Complex128Array( 25 );
	const Zr = new Complex128Array( 25 );
	const Zcv = reinterpret( Zc, 0 );
	const Zrv = reinterpret( Zr, 0 );
	let infoc;
	let infor;
	let i;
	let k;
	for ( k = 0; k < 3; k++ ) {
		for ( i = 0; i < 5; i++ ) {
			ABrv[ 2 * ( ( k * 5 ) + i ) ] = ABcv[ 2 * ( k + ( i * 3 ) ) ];
			ABrv[ ( 2 * ( ( k * 5 ) + i ) ) + 1 ] = ABcv[ ( 2 * ( k + ( i * 3 ) ) ) + 1 ]; // eslint-disable-line max-len
		}
	}
	infoc = zhbevx( 'column-major', 'compute-vectors', 'index', 'upper', 5, 2, ABc, 3, new Complex128Array( 25 ), 5, 0, 0, 2, 4, 0, mc, wc, 1, Zc, 5, new Complex128Array( 5 ), new Float64Array( 35 ), new Int32Array( 25 ), new Int32Array( 5 ), 1 ); // eslint-disable-line max-len
	infor = zhbevx( 'row-major', 'compute-vectors', 'index', 'upper', 5, 2, ABr, 5, new Complex128Array( 25 ), 5, 0, 0, 2, 4, 0, mr, wr, 1, Zr, 5, null, null, null, new Int32Array( 5 ), 1 ); // eslint-disable-line max-len
	assert.equal( infoc, 0 );
	assert.equal( infor, 0 );
	assert.equal( mc[ 0 ], 3 );
	assert.equal( mr[ 0 ], 3 );
	for ( k = 0; k < 3; k++ ) {
		assert.ok( Math.abs( wr[ k ] - wc[ k ] ) <= 1e-12, 'w[' + k + ']' );
		for ( i = 0; i < 5; i++ ) {
			assert.ok( Math.abs( Zrv[ 2 * ( ( i * 5 ) + k ) ] - Zcv[ 2 * ( i + ( k * 5 ) ) ] ) <= 1e-12, 'Re Z(' + i + ',' + k + ')' ); // eslint-disable-line max-len
			assert.ok( Math.abs( Zrv[ ( 2 * ( ( i * 5 ) + k ) ) + 1 ] - Zcv[ ( 2 * ( i + ( k * 5 ) ) ) + 1 ] ) <= 1e-12, 'Im Z(' + i + ',' + k + ')' ); // eslint-disable-line max-len
		}
	}
});

test( 'zhbevx throws RangeError for invalid row-major LDZ', function t() {
	const m = new Int32Array( 1 );
	assert.throws( function throws() {
		zhbevx( 'row-major', 'no-vectors', 'all', 'upper', 3, 1, new Complex128Array( 6 ), 3, new Complex128Array( 9 ), 3, 0, 0, 1, 1, 0, m, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 0, null, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, /Twentieth argument is invalid \(row-major/ );
	assert.throws( function throws() {
		zhbevx( 'row-major', 'compute-vectors', 'index', 'upper', 3, 1, new Complex128Array( 6 ), 3, new Complex128Array( 9 ), 3, 0, 0, 1, 3, 0, m, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 2, null, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		zhbevx( 'row-major', 'compute-vectors', 'all', 'upper', 3, 1, new Complex128Array( 6 ), 3, new Complex128Array( 9 ), 3, 0, 0, 1, 1, 0, m, new Float64Array( 3 ), 1, new Complex128Array( 9 ), 2, null, null, null, new Int32Array( 3 ), 1 ); // eslint-disable-line max-len
	}, /Value: `2`/ );
});
