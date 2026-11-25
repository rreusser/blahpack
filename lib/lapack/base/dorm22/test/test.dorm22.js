/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm22 from './../lib/dorm22.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dorm22 is a function', function t() {
	assert.strictEqual( typeof dorm22, 'function', 'is a function' );
});

test( 'dorm22 has expected arity', function t() {
	assert.strictEqual( dorm22.length, 12, 'has expected arity' );
});

test( 'dorm22 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorm22( 'invalid', 'left', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorm22 throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dorm22( 'row-major', 'invalid', 'no-transpose', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorm22 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dorm22( 'row-major', 'left', 'invalid', 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorm22 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorm22( 'row-major', 'left', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm22 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorm22( 'row-major', 'left', 'no-transpose', 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm22 throws RangeError for negative n2', function t() {
	assert.throws( function throws() {
		// n1 + n2 === M with n2 < 0 passes the n1 check, so the n2 check fires:
		dorm22( 'column-major', 'left', 'no-transpose', 2, 2, 3, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm22 throws RangeError for LDQ too small', function t() {
	assert.throws( function throws() {
		dorm22( 'column-major', 'left', 'no-transpose', 2, 2, 1, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorm22 throws RangeError for LDC too small (column-major)', function t() {
	assert.throws( function throws() {
		dorm22( 'column-major', 'left', 'no-transpose', 2, 3, 1, 1, new Float64Array( 4 ), 2, new Float64Array( 6 ), 1, new Float64Array( 6 ) );
	}, RangeError );
});

test( 'dorm22 throws RangeError for LDC too small (row-major)', function t() {
	assert.throws( function throws() {
		dorm22( 'row-major', 'left', 'no-transpose', 2, 3, 1, 1, new Float64Array( 4 ), 2, new Float64Array( 6 ), 2, new Float64Array( 6 ) );
	}, RangeError );
});

/**
* Returns a deterministic test array.
*
* @private
* @param {NonNegativeInteger} n - length
* @param {number} shift - value shift
* @returns {Float64Array} array
*/
function fill( n, shift ) {
	const out = new Float64Array( n );
	let i;
	for ( i = 0; i < n; i++ ) {
		out[ i ] = Math.sin( ( i * 0.7 ) + shift ) + ( 0.1 * i );
	}
	return out;
}

/**
* Asserts that the wrapper matches `ndarray` for a given layout and options.
*
* @private
* @param {string} order - storage layout
* @param {string} side - operation side
* @param {string} trans - transpose option
* @param {boolean} nullWork - whether to pass `null` workspace to the wrapper
*/
function checkLayout( order, side, trans, nullWork ) {
	const M = 5;
	const N = 4;
	const nq = ( side === 'left' ) ? M : N;
	const n1 = ( side === 'left' ) ? 3 : 2;
	const n2 = nq - n1;
	const LDQ = nq;
	const LDC = ( order === 'column-major' ) ? M : N;
	const Q = fill( nq * nq, 0.3 );
	const C1 = fill( M * N, 1.1 );
	const C2 = new Float64Array( C1 );
	const W1 = ( nullWork ) ? null : new Float64Array( M * N );
	const W2 = new Float64Array( M * N );
	let sq1;
	let sq2;
	let sc1;
	let sc2;
	let i;
	if ( order === 'column-major' ) {
		sq1 = 1;
		sq2 = LDQ;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sq1 = LDQ;
		sq2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	const info1 = dorm22( order, side, trans, M, N, n1, n2, Q, LDQ, C1, LDC, W1 );
	const info2 = ndarray( side, trans, M, N, n1, n2, Q, sq1, sq2, 0, C2, sc1, sc2, 0, W2, 1, 0 );
	assert.strictEqual( info1, 0, 'info' );
	assert.strictEqual( info1, info2, 'info matches ndarray' );
	for ( i = 0; i < C1.length; i++ ) {
		assert.strictEqual( C1[ i ], C2[ i ], order + ' ' + side + ' ' + trans + ' C[' + i + ']' );
	}
	// Sanity: the operation actually changed C.
	assert.notDeepStrictEqual( C1, fill( M * N, 1.1 ), 'C was updated' );
}

test( 'dorm22 matches ndarray (column-major)', function t() {
	checkLayout( 'column-major', 'left', 'no-transpose', false );
	checkLayout( 'column-major', 'left', 'transpose', false );
	checkLayout( 'column-major', 'right', 'no-transpose', false );
	checkLayout( 'column-major', 'right', 'transpose', false );
});

test( 'dorm22 matches ndarray (row-major)', function t() {
	checkLayout( 'row-major', 'left', 'no-transpose', false );
	checkLayout( 'row-major', 'left', 'transpose', false );
	checkLayout( 'row-major', 'right', 'no-transpose', false );
	checkLayout( 'row-major', 'right', 'transpose', false );
});

test( 'dorm22 allocates workspace when WORK is null', function t() {
	checkLayout( 'column-major', 'left', 'no-transpose', true );
	checkLayout( 'row-major', 'right', 'transpose', true );
});
