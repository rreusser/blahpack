

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerq2 from './../lib/ndarray.js';

// FIXTURES //

import _3x4 from './fixtures/3x4.json' with { type: 'json' };
import _4x3 from './fixtures/4x3.json' with { type: 'json' };
import _3x3 from './fixtures/3x3.json' with { type: 'json' };
import _1x4 from './fixtures/1x4.json' with { type: 'json' };
import _3x1 from './fixtures/3x1.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _2x5 from './fixtures/2x5.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Run zgerq2 on a packed complex column-major matrix.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Float64Array} aFlat - interleaved re/im column-major entries (length 2*M*N)
* @returns {Object} result with A (Float64Array), TAU (Float64Array), info
*/
function runZgerq2( M, N, aFlat ) {
	var WORK = new Complex128Array( Math.max( 1, M ) );
	var TAU = new Complex128Array( Math.max( 1, Math.min( M, N ) ) );
	var A = new Complex128Array( Math.max( 1, M * N ) );
	var Av = reinterpret( A, 0 );
	var info;
	var i;

	// Copy input into A
	for ( i = 0; i < aFlat.length; i++ ) {
		Av[ i ] = aFlat[ i ];
	}

	info = zgerq2( M, N, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

	return {
		A: Array.from( Av ).slice( 0, 2 * M * N ),
		TAU: Array.from( reinterpret( TAU, 0 ) ).slice( 0, 2 * Math.min( M, N ) ),
		info: info
	};
}

// TESTS //

test( 'zgerq2: 3x4 (M < N)', function t() {
	var tc = _3x4;
	// Input: 3x4 complex matrix stored column-major with LDA=3
	var aFlat = [
		2, 1, 1, 0, 3, -1,
		1, 2, 4, 1, 2, 0,
		3, 0, 2, -1, 5, 2,
		1, 1, 3, 0, 2, -2
	];
	var res = runZgerq2( 3, 4, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: 4x3 (M > N)', function t() {
	var tc = _4x3;
	// Input: 4x3 complex matrix stored column-major with LDA=4
	var aFlat = [
		2, 1, 1, -1, 3, 0, 1, 2,
		1, 0, 4, 1, 2, -1, 3, 0,
		3, 1, 2, 0, 5, -2, 1, 1
	];
	var res = runZgerq2( 4, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: 3x3 (square)', function t() {
	var tc = _3x3;
	var aFlat = [
		4, 1, 1, 0, 2, -1,
		1, -1, 3, 2, 1, 0,
		2, 0, 1, 1, 5, -2
	];
	var res = runZgerq2( 3, 3, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: 1x4 (single row)', function t() {
	var tc = _1x4;
	var aFlat = [
		1, 2, 2, -1, 3, 0, 4, 1
	];
	var res = runZgerq2( 1, 4, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: 3x1 (single column)', function t() {
	var tc = _3x1;
	var aFlat = [
		2, 1, 3, -1, 4, 0
	];
	var res = runZgerq2( 3, 1, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: M=0 (quick return)', function t() {
	var tc = m_zero;
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zgerq2( 0, 3, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgerq2: N=0 (quick return)', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zgerq2( 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgerq2: 1x1', function t() {
	var tc = _1x1;
	var aFlat = [ 5, 3 ];
	var res = runZgerq2( 1, 1, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});

test( 'zgerq2: 2x5 (wide)', function t() {
	var tc = _2x5;
	// 2x5 column-major with LDA=2: columns stored sequentially
	var aFlat = [
		1, 0, 6, -1,
		2, 1, 7, 0,
		3, -1, 8, 2,
		4, 0, 9, -1,
		5, 1, 10, 0
	];
	var res = runZgerq2( 2, 5, aFlat );
	assert.equal( res.info, tc.info );
	assertArrayClose( res.A, tc.a, 1e-14, 'a' );
	assertArrayClose( res.TAU, tc.tau, 1e-14, 'tau' );
});
