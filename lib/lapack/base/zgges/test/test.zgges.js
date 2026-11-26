
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from './../lib/zgges.js';


// FUNCTIONS //

function nosel() {
	return false;
}


// TESTS //

test( 'zgges is a function', function t() {
	assert.strictEqual( typeof zgges, 'function', 'is a function' );
});

test( 'zgges: column-major basic 2x2 no-vectors', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( 1 + N ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( 1 + N ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, N, A, N, B, N, sdim, ALPHA, 1, BETA, 1, VSL, N, VSR, N, null, null, null );
	assert.equal( res, 0, 'info' );
});

test( 'zgges: row-major basic 2x2 with vectors', function t() {
	const sdim = new Int32Array( 1 );
	const N = 2;
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 );
	const bv = reinterpret( B, 0 );
	av[ 0 ] = 2.0; av[ 2 * ( N + 1 ) ] = 3.0;
	bv[ 0 ] = 1.0; bv[ 2 * ( N + 1 ) ] = 1.0;
	const ALPHA = new Complex128Array( N );
	const BETA = new Complex128Array( N );
	const VSL = new Complex128Array( N * N );
	const VSR = new Complex128Array( N * N );
	const res = zgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', nosel, N, A, N, B, N, sdim, ALPHA, 1, BETA, 1, VSL, N, VSR, N, null, null, null );
	assert.equal( res, 0, 'info' );
});

test( 'zgges has expected arity', function t() {
	assert.strictEqual( zgges.length, 22, 'has expected arity' );
});

test( 'zgges throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'invalid', 'no-vectors', 'no-vectors', 'none', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgges throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDA < N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDB < N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDVSL < 1', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgges throws RangeError when LDVSR < 1', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		zgges( 'column-major', 'no-vectors', 'no-vectors', 'none', nosel, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, sdim, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0 );
	}, RangeError );
});

test( 'zgges: N=0 with WORK = RWORK = BWORK = null matches explicit workspace (quick return, info=0, sdim=0)', function t() {
	const sdimNull = new Int32Array( [ 7 ] );
	const sdimExp = new Int32Array( [ 7 ] );
	const got = zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'sort', nosel, 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, sdimNull, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, null, null, null );
	const expected = zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'sort', nosel, 0, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, sdimExp, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), new Float64Array( 1 ), new Uint8Array( 1 ) );
	assert.equal( got, 0, 'info' );
	assert.equal( got, expected, 'info matches explicit workspace' );
	assert.equal( sdimNull[ 0 ], 0, 'sdim' );
	assert.equal( sdimNull[ 0 ], sdimExp[ 0 ], 'sdim matches explicit workspace' );
});

test( 'zgges: a null WORK is allocated at the reference\'s optimal size (LWKOPT plus the zunmqr T part), so the zunmqr step is blocked as with an optimal workspace', function t() {
	const N = 48;
	const lopt = N + ( N * 32 ) + 4160; // N + N*ILAENV( 1, 'ZUNMQR', ... ) + TSIZE, ILAENV = 32
	const A0 = new Float64Array( 2 * N * N );
	const B0 = new Float64Array( 2 * N * N );
	const out = [];
	let WORK;
	let k;
	let r;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			k = 2 * ( i + ( j * N ) );
			A0[ k ] = Math.sin( ( ( i + 1 ) * ( j + 2 ) ) + 0.5 );
			A0[ k + 1 ] = Math.cos( ( i + 2 ) * ( j + 1 ) );
			B0[ k ] = ( ( i === j ) ? 4.0 : 0.0 ) + Math.cos( ( i + 3 ) * ( j + 1 ) );
			B0[ k + 1 ] = Math.sin( ( i + 1 ) + ( 2 * j ) );
		}
	}
	for ( r = 0; r < 2; r++ ) {
		const A = new Complex128Array( A0 );
		const B = new Complex128Array( B0 );
		const VSL = new Complex128Array( N * N );
		const VSR = new Complex128Array( N * N );
		const ALPHA = new Complex128Array( N );
		const BETA = new Complex128Array( N );
		WORK = ( r === 0 ) ? null : new Complex128Array( lopt );
		assert.equal( zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', nosel, N, A, N, B, N, new Int32Array( 1 ), ALPHA, 1, BETA, 1, VSL, N, VSR, N, WORK, null, null ), 0, 'info' ); // eslint-disable-line max-len
		out.push( [ A, B, VSL, VSR, ALPHA, BETA ].map( function f( x ) {
			return Array.from( new Float64Array( x.buffer ) );
		}) );
	}
	assert.deepEqual( out[ 0 ], out[ 1 ], 'null WORK is bit-identical to the optimal WORK' );
});
