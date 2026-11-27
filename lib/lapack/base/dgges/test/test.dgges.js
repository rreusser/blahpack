
/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgges from './../lib/dgges.js';


// FUNCTIONS //

/**
* Noop selection function.
*
* @private
* @returns {boolean} false
*/
function noop() {
	return false;
}


// TESTS //

test( 'dgges is a function', function t() {
	assert.strictEqual( typeof dgges, 'function', 'is a function' );
});

test( 'dgges has expected arity', function t() {
	assert.strictEqual( dgges.length, 23, 'has expected arity' );
});

test( 'dgges throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'invalid', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgges throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgges throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgges throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		const sdim = new Int32Array( 1 );
		dgges( 'row-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, sdim, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgges: a null WORK is allocated at the reference\'s optimal size (MAXWRK plus the dormqr T part), so the dormqr step is blocked as with an optimal workspace', function t() {
	const N = 48;
	const lopt = ( 7 * N ) + ( N * 32 ) + 4160; // MINWRK - N + N*ILAENV( 1, 'DORMQR', ... ) + TSIZE, ILAENV = 32
	const A0 = new Float64Array( N * N );
	const B0 = new Float64Array( N * N );
	const out = [];
	let WORK;
	let r;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A0[ i + ( j * N ) ] = Math.sin( ( ( i + 1 ) * ( j + 2 ) ) + 0.5 );
			B0[ i + ( j * N ) ] = ( ( i === j ) ? 4.0 : 0.0 ) + Math.cos( ( i + 3 ) * ( j + 1 ) );
		}
	}
	for ( r = 0; r < 2; r++ ) {
		const A = new Float64Array( A0 );
		const B = new Float64Array( B0 );
		const VSL = new Float64Array( N * N );
		const VSR = new Float64Array( N * N );
		const ar = new Float64Array( N );
		const ai = new Float64Array( N );
		const be = new Float64Array( N );
		WORK = ( r === 0 ) ? null : new Float64Array( lopt );
		assert.equal( dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, N, A, N, B, N, new Int32Array( 1 ), ar, 1, ai, 1, be, 1, VSL, N, VSR, N, WORK, null ), 0, 'info' ); // eslint-disable-line max-len
		out.push( [ A, B, VSL, VSR, ar, ai, be ].map( function f( x ) {
			return Array.from( x );
		}) );
	}
	assert.deepEqual( out[ 0 ], out[ 1 ], 'null WORK is bit-identical to the optimal WORK' );
});
