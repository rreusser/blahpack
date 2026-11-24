/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbsvx from './../lib/dpbsvx.js';


// TESTS //

test( 'dpbsvx is a function', function t() {
	assert.strictEqual( typeof dpbsvx, 'function', 'is a function' );
});

test( 'dpbsvx has expected arity', function t() {
	assert.strictEqual( dpbsvx.length, 24, 'has expected arity' );
});

test( 'dpbsvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpbsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbsvx( 'column-major', 'equilibrate', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dpbsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpbsvx( 'column-major', 'equilibrate', 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dpbsvx: row-major and column-major layouts give the same solution (equilibrate, both triangles, 2 RHS)', function t() { // eslint-disable-line max-len
	// Symmetric positive definite pentadiagonal (KD=2), badly scaled: A = D*M*D
	const d = [ 1e-3, 1, 1e3, 1e-2 ];
	const M = [
		[ 6, 1, 0.5, 0 ],
		[ 1, 7, -1, 0.25 ],
		[ 0.5, -1, 8, 1 ],
		[ 0, 0.25, 1, 9 ]
	];
	const xtrue = [ [ 1, -2, 3, -4 ], [ 0.5, 0.25, -1, 2 ] ];
	const layouts = [ 'column-major', 'row-major' ];
	const uplos = [ 'upper', 'lower' ];
	const N = 4;
	const kd = 2;
	const nrhs = 2;
	let results;
	let equed;
	let rcond;
	let FERR;
	let BERR;
	let info;
	let err;
	let br;
	let xn;
	let ix;
	let AB;
	let B;
	let X;
	let s;
	let i;
	let j;
	let k;
	let o;
	let u;
	for ( u = 0; u < uplos.length; u++ ) {
		results = [];
		for ( o = 0; o < layouts.length; o++ ) {
			AB = new Float64Array( ( kd + 1 ) * N );
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < N; i++ ) {
					if ( uplos[ u ] === 'upper' && i <= j && j - i <= kd ) {
						br = ( kd + i ) - j;
					} else if ( uplos[ u ] === 'lower' && i >= j && i - j <= kd ) {
						br = i - j;
					} else {
						continue;
					}
					AB[ ( layouts[ o ] === 'column-major' ) ? br + ( j * ( kd + 1 ) ) : ( br * N ) + j ] = d[ i ] * M[ i ][ j ] * d[ j ]; // eslint-disable-line max-len
				}
			}
			B = new Float64Array( N * nrhs );
			for ( k = 0; k < nrhs; k++ ) {
				for ( i = 0; i < N; i++ ) {
					s = 0.0;
					for ( j = 0; j < N; j++ ) {
						s += d[ i ] * M[ i ][ j ] * d[ j ] * xtrue[ k ][ j ];
					}
					B[ ( layouts[ o ] === 'column-major' ) ? i + ( k * N ) : ( i * nrhs ) + k ] = s; // eslint-disable-line max-len
				}
			}
			X = new Float64Array( N * nrhs );
			FERR = new Float64Array( nrhs );
			BERR = new Float64Array( nrhs );
			rcond = new Float64Array( 1 );
			equed = [ 'none' ];
			if ( layouts[ o ] === 'column-major' ) {
				info = dpbsvx( 'column-major', 'equilibrate', uplos[ u ], N, kd, nrhs, AB, kd + 1, new Float64Array( ( kd + 1 ) * N ), kd + 1, equed, new Float64Array( N ), 1, B, N, X, N, rcond, FERR, 1, BERR, 1, null, null ); // eslint-disable-line max-len
			} else {
				info = dpbsvx( 'row-major', 'equilibrate', uplos[ u ], N, kd, nrhs, AB, N, new Float64Array( ( kd + 1 ) * N ), N, equed, new Float64Array( N ), 1, B, nrhs, X, nrhs, rcond, FERR, 1, BERR, 1, null, new Int32Array( N ) ); // eslint-disable-line max-len
			}
			assert.equal( info, 0, 'info' );
			assert.equal( equed[ 0 ], 'yes', 'equed' );
			for ( k = 0; k < nrhs; k++ ) {
				err = 0.0;
				xn = 0.0;
				for ( i = 0; i < N; i++ ) {
					ix = ( layouts[ o ] === 'column-major' ) ? i + ( k * N ) : ( i * nrhs ) + k; // eslint-disable-line max-len
					err = Math.max( err, Math.abs( X[ ix ] - xtrue[ k ][ i ] ) );
					xn = Math.max( xn, Math.abs( X[ ix ] ) );
				}
				assert.ok( err / xn <= FERR[ k ], uplos[ u ] + '/' + layouts[ o ] + ': FERR bounds the forward error' ); // eslint-disable-line max-len
				assert.ok( err / xn <= 1e-9, uplos[ u ] + '/' + layouts[ o ] + ': X solves A*X = B' ); // eslint-disable-line max-len
				assert.ok( BERR[ k ] <= 1e-15, 'BERR' );
			}
			results.push({
				'rcond': rcond[ 0 ],
				'FERR': Array.from( FERR )
			});
		}
		assert.deepEqual( results[ 1 ], results[ 0 ], uplos[ u ] + ': layout invariance' ); // eslint-disable-line max-len
	}
});
