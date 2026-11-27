/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptri from './../lib/dsptri.js';
import dsptriNd from './../lib/ndarray.js';
import dsptrf from '../../dsptrf/lib/ndarray.js';


// FUNCTIONS //

/**
* Unpacks a column-major packed symmetric matrix into a full 2-D array.
*
* @private
* @param {string} uplo - stored triangle
* @param {NonNegativeInteger} N - order
* @param {Float64Array} AP - packed matrix
* @returns {Array<Array<number>>} full matrix
*/
function unpack( uplo, N, AP ) {
	const out = [];
	let p;
	let i;
	let j;
	for ( i = 0; i < N; i += 1 ) {
		out.push( new Array( N ).fill( 0.0 ) );
	}
	p = 0;
	for ( j = 0; j < N; j += 1 ) {
		const lo = ( uplo === 'upper' ) ? 0 : j;
		const hi = ( uplo === 'upper' ) ? j : N - 1;
		for ( i = lo; i <= hi; i += 1 ) {
			out[ i ][ j ] = AP[ p ];
			out[ j ][ i ] = AP[ p ];
			p += 1;
		}
	}
	return out;
}


// TESTS //

test( 'dsptri is a function', function t() {
	assert.strictEqual( typeof dsptri, 'function', 'is a function' );
});

test( 'dsptri has expected arity', function t() {
	assert.strictEqual( dsptri.length, 7, 'has expected arity' );
});

test( 'dsptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, null );
	}, TypeError );
});

test( 'dsptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptri( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, null );
	}, RangeError );
});

test( 'dsptri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsptri( 'invalid', 'upper', 2, new Float64Array( 3 ), new Int32Array( 2 ), 1, null );
	}, TypeError );
});

test( 'dsptri throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dsptri( 'row-major', 'upper', 2, new Float64Array( 3 ), new Int32Array( 2 ), 1, null );
	}, TypeError );
});

test( 'dsptri (column-major) matches ndarray, with WORK=null and with caller WORK, and inverts A', function t() {
	// Indefinite 4x4 symmetric matrix (forces 2x2 pivots), packed both ways:
	const A = [
		[ 0.0, 2.0, 1.0, -1.0 ],
		[ 2.0, 0.0, 3.0, 0.5 ],
		[ 1.0, 3.0, -1.0, 2.0 ],
		[ -1.0, 0.5, 2.0, 1.0 ]
	];
	const uplos = [ 'upper', 'lower' ];
	const strides = [ 1, -1 ];
	let IPIV;
	let APf;
	let APa;
	let APb;
	let APe;
	let ap;
	let oi;
	let si;
	let N;
	let u;
	let i;
	let j;
	let k;
	let s;
	N = 4;
	for ( u = 0; u < uplos.length; u += 1 ) {
		ap = [];
		for ( j = 0; j < N; j += 1 ) {
			if ( uplos[ u ] === 'upper' ) {
				for ( i = 0; i <= j; i += 1 ) {
					ap.push( A[ i ][ j ] );
				}
			} else {
				for ( i = j; i < N; i += 1 ) {
					ap.push( A[ i ][ j ] );
				}
			}
		}
		for ( s = 0; s < strides.length; s += 1 ) {
			si = strides[ s ];
			oi = ( si < 0 ) ? N - 1 : 0;
			APf = new Float64Array( ap );
			IPIV = new Int32Array( N );
			assert.strictEqual( dsptrf( uplos[ u ], N, APf, 1, 0, IPIV, si, oi ), 0 );
			APa = new Float64Array( APf );
			APb = new Float64Array( APf );
			APe = new Float64Array( APf );
			assert.strictEqual( dsptri( 'column-major', uplos[ u ], N, APa, new Int32Array( IPIV ), si, null ), 0 );
			assert.strictEqual( dsptri( 'column-major', uplos[ u ], N, APb, new Int32Array( IPIV ), si, new Float64Array( N ) ), 0 );
			assert.strictEqual( dsptriNd( uplos[ u ], N, APe, 1, 0, new Int32Array( IPIV ), si, oi, new Float64Array( N ), 1, 0 ), 0 );
			for ( i = 0; i < APe.length; i += 1 ) {
				assert.strictEqual( APa[ i ], APe[ i ], uplos[ u ] + ' WORK=null AP[' + i + ']' );
				assert.strictEqual( APb[ i ], APe[ i ], uplos[ u ] + ' WORK AP[' + i + ']' );
			}
			// inv(A) * A = I:
			const Ainv = unpack( uplos[ u ], N, APa );
			for ( i = 0; i < N; i += 1 ) {
				for ( j = 0; j < N; j += 1 ) {
					let sum = 0.0;
					for ( k = 0; k < N; k += 1 ) {
						sum += Ainv[ i ][ k ] * A[ k ][ j ];
					}
					assert.ok( Math.abs( sum - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-12, uplos[ u ] + ' (inv(A)*A)[' + i + ',' + j + '] = ' + sum );
				}
			}
		}
	}
});
