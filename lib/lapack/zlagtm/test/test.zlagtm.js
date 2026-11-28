/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlagtm from './../lib/zlagtm.js';


// TESTS //

test( 'zlagtm is a function', function t() {
	assert.strictEqual( typeof zlagtm, 'function', 'is a function' );
});

test( 'zlagtm has expected arity', function t() {
	assert.strictEqual( zlagtm.length, 16, 'has expected arity' );
});

test( 'zlagtm throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlagtm( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlagtm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlagtm( 'column-major', 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlagtm throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zlagtm( 'column-major', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

/**
* Computes `alpha*op(A)*X + beta*B` for a dense complex tridiagonal `A` (reference oracle).
*
* @private
* @param {string} trans - transpose operation
* @param {NonNegativeInteger} N - order of A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {number} alpha - real scalar
* @param {Array} dl - sub-diagonal as [re,im] pairs
* @param {Array} d - diagonal as [re,im] pairs
* @param {Array} du - super-diagonal as [re,im] pairs
* @param {Function} x - accessor `x(i,j)` returning [re,im]
* @param {number} beta - real scalar
* @param {Function} b - accessor `b(i,j)` returning [re,im]
* @returns {Array} result as rows of [re,im]
*/
function denseRef( trans, N, nrhs, alpha, dl, d, du, x, beta, b ) {
	const out = [];
	let sr;
	let si;
	let ar;
	let ai;
	let xk;
	let bv;
	let v;
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
		return [ 0.0, 0.0 ];
	}
	for ( i = 0; i < N; i++ ) {
		out.push( [] );
		for ( j = 0; j < nrhs; j++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				v = ( trans === 'no-transpose' ) ? a( i, k ) : a( k, i );
				ar = v[ 0 ];
				ai = ( trans === 'conjugate-transpose' ) ? -v[ 1 ] : v[ 1 ];
				xk = x( k, j );
				sr += ( ar * xk[ 0 ] ) - ( ai * xk[ 1 ] );
				si += ( ar * xk[ 1 ] ) + ( ai * xk[ 0 ] );
			}
			bv = b( i, j );
			out[ i ].push( [ ( alpha * sr ) + ( beta * bv[ 0 ] ), ( alpha * si ) + ( beta * bv[ 1 ] ) ] );
		}
	}
	return out;
}

test( 'zlagtm matches a dense multiply in both storage orders', function t() {
	const trans = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
	const nrhs = 3;
	const ab = [ [ 1.0, 0.0 ], [ -1.0, 1.0 ], [ 1.0, -1.0 ], [ 0.0, 1.0 ], [ -1.0, -1.0 ] ];
	const dl = [ [ 3.0, 1.0 ], [ 1.5, -2.0 ], [ -2.0, 0.5 ], [ 0.5, 3.0 ] ];
	const du = [ [ -1.0, 1.0 ], [ -2.5, 3.0 ], [ 3.0, -1.0 ], [ 4.0, 0.25 ] ];
	const d = [ [ 2.0, 1.0 ], [ 4.0, 2.0 ], [ 5.0, -1.0 ], [ -6.0, 3.0 ], [ 1.0, -0.5 ] ];
	const N = 5;
	const LD = 7;
	let order;
	let ref;
	let Xv;
	let Bv;
	let ox;
	let X;
	let B;
	let o;
	let p;
	let q;
	let i;
	let j;
	function xv( r, c ) {
		return [ ( r + 1 ) - ( 2 * c ), ( 0.25 * r * c ) - 1.0 ];
	}
	function bv( r, c ) {
		return [ ( 0.5 * r ) + c - 1.0, r - c ];
	}
	function flat( arr ) {
		const out = [];
		let m;
		for ( m = 0; m < arr.length; m++ ) {
			out.push( arr[ m ][ 0 ], arr[ m ][ 1 ] );
		}
		return new Complex128Array( out );
	}
	for ( o = 0; o < 2; o++ ) {
		order = ( o === 0 ) ? 'column-major' : 'row-major';
		for ( p = 0; p < trans.length; p++ ) {
			for ( q = 0; q < ab.length; q++ ) {
				X = new Complex128Array( LD * N );
				B = new Complex128Array( LD * N );
				Xv = reinterpret( X, 0 );
				Bv = reinterpret( B, 0 );
				for ( i = 0; i < N; i++ ) {
					for ( j = 0; j < nrhs; j++ ) {
						ox = 2 * ( ( o === 0 ) ? i + ( j * LD ) : ( i * LD ) + j );
						Xv[ ox ] = xv( i, j )[ 0 ];
						Xv[ ox + 1 ] = xv( i, j )[ 1 ];
						Bv[ ox ] = bv( i, j )[ 0 ];
						Bv[ ox + 1 ] = bv( i, j )[ 1 ];
					}
				}
				zlagtm( order, trans[ p ], N, nrhs, ab[ q ][ 0 ], flat( dl ), 1, flat( d ), 1, flat( du ), 1, X, LD, ab[ q ][ 1 ], B, LD );
				ref = denseRef( trans[ p ], N, nrhs, ab[ q ][ 0 ], dl, d, du, xv, ab[ q ][ 1 ], bv );
				for ( i = 0; i < N; i++ ) {
					for ( j = 0; j < nrhs; j++ ) {
						ox = 2 * ( ( o === 0 ) ? i + ( j * LD ) : ( i * LD ) + j );
						assert.ok( Math.abs( Bv[ ox ] - ref[ i ][ j ][ 0 ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ref[ i ][ j ][ 0 ] ) ), order + ' ' + trans[ p ] + ' re B(' + i + ',' + j + ')' );
						assert.ok( Math.abs( Bv[ ox + 1 ] - ref[ i ][ j ][ 1 ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ref[ i ][ j ][ 1 ] ) ), order + ' ' + trans[ p ] + ' im B(' + i + ',' + j + ')' );
					}
				}
			}
		}
	}
});

test( 'zlagtm throws RangeError for too-small leading dimensions', function t() {
	const v = new Complex128Array( 16 );
	assert.throws( function throws() {
		zlagtm( 'column-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 3, 0.0, v, 4 );
	}, RangeError );
	assert.throws( function throws() {
		zlagtm( 'column-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 4, 0.0, v, 3 );
	}, RangeError );
	assert.throws( function throws() {
		zlagtm( 'row-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 1, 0.0, v, 2 );
	}, RangeError );
	assert.throws( function throws() {
		zlagtm( 'row-major', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 2, 0.0, v, 1 );
	}, RangeError );
	assert.throws( function throws() {
		zlagtm( 'invalid', 'no-transpose', 4, 2, 1.0, v, 1, v, 1, v, 1, v, 4, 0.0, v, 4 );
	}, TypeError );
});
