/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagtm from './../lib/dlagtm.js';


// TESTS //

test( 'dlagtm is a function', function t() {
	assert.strictEqual( typeof dlagtm, 'function', 'is a function' );
});

test( 'dlagtm has expected arity', function t() {
	assert.strictEqual( dlagtm.length, 16, 'has expected arity' );
});

test( 'dlagtm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlagtm( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlagtm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlagtm( 'column-major', 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlagtm throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dlagtm( 'column-major', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

/**
* Computes `alpha*op(A)*X + beta*B` for a dense tridiagonal `A` (reference oracle).
*
* @private
* @param {string} trans - transpose operation
* @param {NonNegativeInteger} N - order of A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {number} alpha - scalar
* @param {Array} dl - sub-diagonal
* @param {Array} d - diagonal
* @param {Array} du - super-diagonal
* @param {Function} x - accessor `x(i,j)`
* @param {number} beta - scalar
* @param {Function} b - accessor `b(i,j)`
* @returns {Array} result as array of rows
*/
function denseRef( trans, N, nrhs, alpha, dl, d, du, x, beta, b ) {
	const out = [];
	let s;
	let i;
	let j;
	let k;
	function a( r, c ) {
		if ( r === c ) {
			return d[ r ];
		}
		if ( r === c + 1 ) {
			return dl[ c ];
		}
		if ( c === r + 1 ) {
			return du[ r ];
		}
		return 0.0;
	}
	for ( i = 0; i < N; i++ ) {
		out.push( [] );
		for ( j = 0; j < nrhs; j++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += ( ( trans === 'no-transpose' ) ? a( i, k ) : a( k, i ) ) * x( k, j );
			}
			out[ i ].push( ( alpha * s ) + ( beta * b( i, j ) ) );
		}
	}
	return out;
}

test( 'dlagtm matches a dense multiply in both storage orders', function t() {
	const trans = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
	const nrhs = 3;
	const ab = [ [ 1.0, 0.0 ], [ -1.0, 1.0 ], [ 1.0, -1.0 ], [ 0.0, 1.0 ], [ -1.0, -1.0 ] ];
	const dl = [ 3.0, 1.5, -2.0, 0.5 ];
	const du = [ -1.0, -2.5, 3.0, 4.0 ];
	const d = [ 2.0, 4.0, 5.0, -6.0, 1.0 ];
	const N = 5;
	const LD = 7;
	let order;
	let ref;
	let ox;
	let ob;
	let X;
	let B;
	let o;
	let p;
	let q;
	let i;
	let j;
	function xv( r, c ) {
		return ( r + 1 ) - ( 2 * c ) + ( 0.25 * r * c );
	}
	function bv( r, c ) {
		return ( 0.5 * r ) + c - 1.0;
	}
	for ( o = 0; o < 2; o++ ) {
		order = ( o === 0 ) ? 'column-major' : 'row-major';
		for ( p = 0; p < trans.length; p++ ) {
			for ( q = 0; q < ab.length; q++ ) {
				X = new Float64Array( LD * N );
				B = new Float64Array( LD * N );
				for ( i = 0; i < N; i++ ) {
					for ( j = 0; j < nrhs; j++ ) {
						ox = ( o === 0 ) ? i + ( j * LD ) : ( i * LD ) + j;
						X[ ox ] = xv( i, j );
						B[ ox ] = bv( i, j );
					}
				}
				dlagtm( order, trans[ p ], N, nrhs, ab[ q ][ 0 ], new Float64Array( dl ), 1, new Float64Array( d ), 1, new Float64Array( du ), 1, X, LD, ab[ q ][ 1 ], B, LD );
				ref = denseRef( trans[ p ], N, nrhs, ab[ q ][ 0 ], dl, d, du, xv, ab[ q ][ 1 ], bv );
				for ( i = 0; i < N; i++ ) {
					for ( j = 0; j < nrhs; j++ ) {
						ob = ( o === 0 ) ? i + ( j * LD ) : ( i * LD ) + j;
						assert.ok( Math.abs( B[ ob ] - ref[ i ][ j ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ref[ i ][ j ] ) ), order + ' ' + trans[ p ] + ' B(' + i + ',' + j + ')' );
					}
				}
			}
		}
	}
});

test( 'dlagtm throws RangeError for too-small leading dimensions', function t() {
	const v = new Float64Array( 16 );
	assert.throws( function throws() {
		dlagtm( 'column-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 3, 0.0, v, 4 );
	}, RangeError );
	assert.throws( function throws() {
		dlagtm( 'column-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 4, 0.0, v, 3 );
	}, RangeError );
	assert.throws( function throws() {
		dlagtm( 'row-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 1, 0.0, v, 2 );
	}, RangeError );
	assert.throws( function throws() {
		dlagtm( 'row-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 2, 0.0, v, 1 );
	}, RangeError );
	assert.throws( function throws() {
		dlagtm( 'invalid', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 4, 0.0, v, 4 );
	}, TypeError );
});
