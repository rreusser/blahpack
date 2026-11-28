/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbsvx from './../lib/zpbsvx.js';


// TESTS //

test( 'zpbsvx is a function', function t() {
	assert.strictEqual( typeof zpbsvx, 'function', 'is a function' );
});

test( 'zpbsvx has expected arity', function t() {
	assert.strictEqual( zpbsvx.length, 24, 'has expected arity' );
});

test( 'zpbsvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpbsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpbsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpbsvx( 'column-major', 'equilibrate', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zpbsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpbsvx( 'column-major', 'equilibrate', 'upper', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zpbsvx: row-major and column-major layouts give the same solution (equilibrate, both triangles, 2 RHS)', function t() { // eslint-disable-line max-len
	// Hermitian positive definite tridiagonal, badly scaled: A = D*M*D, D = diag(1e-3, 1, 1e3)
	const d = [ 1e-3, 1, 1e3 ];
	const diag = [ 4, 5, 6 ];
	const off = [ [ 1, 0.5 ], [ -1, 1 ] ];
	const xtrue = [ [ 1, -1, -2, 0.5, 3, 2 ], [ 0, 1, 1, 0, -1, -1 ] ];
	const layouts = [ 'column-major', 'row-major' ];
	const uplos = [ 'upper', 'lower' ];
	const N = 3;
	const nrhs = 2;
	let results;
	let equed;
	let rcond;
	let FERR;
	let BERR;
	let off2;
	let abv;
	let err;
	let ib;
	let br;
	let re;
	let im;
	let xv;
	let bv;
	let xn;
	let AB;
	let B;
	let X;
	let i;
	let j;
	let k;
	let o;
	let u;
	for ( u = 0; u < uplos.length; u++ ) {
		results = [];
		for ( o = 0; o < layouts.length; o++ ) {
			AB = new Complex128Array( 2 * N );
			abv = reinterpret( AB, 0 );
			for ( j = 0; j < N; j++ ) {
				// Diagonal:
				br = ( uplos[ u ] === 'upper' ) ? 1 : 0;
				k = ( layouts[ o ] === 'column-major' ) ? br + ( j * 2 ) : ( br * N ) + j; // eslint-disable-line max-len
				abv[ 2 * k ] = d[ j ] * diag[ j ] * d[ j ];
				if ( uplos[ u ] === 'upper' && j > 0 ) {
					// A(j-1,j) in band row 0:
					k = ( layouts[ o ] === 'column-major' ) ? ( j * 2 ) : j;
					abv[ 2 * k ] = d[ j - 1 ] * off[ j - 1 ][ 0 ] * d[ j ];
					abv[ ( 2 * k ) + 1 ] = d[ j - 1 ] * off[ j - 1 ][ 1 ] * d[ j ];
				} else if ( uplos[ u ] === 'lower' && j < N - 1 ) {
					// A(j+1,j) = conj(A(j,j+1)) in band row 1:
					k = ( layouts[ o ] === 'column-major' ) ? 1 + ( j * 2 ) : N + j;
					abv[ 2 * k ] = d[ j ] * off[ j ][ 0 ] * d[ j + 1 ];
					abv[ ( 2 * k ) + 1 ] = -d[ j ] * off[ j ][ 1 ] * d[ j + 1 ];
				}
			}
			// B = A*xtrue (dense Hermitian product):
			B = new Complex128Array( N * nrhs );
			bv = reinterpret( B, 0 );
			for ( k = 0; k < nrhs; k++ ) {
				for ( i = 0; i < N; i++ ) {
					re = d[ i ] * diag[ i ] * d[ i ] * xtrue[ k ][ 2 * i ];
					im = d[ i ] * diag[ i ] * d[ i ] * xtrue[ k ][ ( 2 * i ) + 1 ];
					if ( i < N - 1 ) {
						// A(i,i+1) * x(i+1)
						off2 = [ d[ i ] * off[ i ][ 0 ] * d[ i + 1 ], d[ i ] * off[ i ][ 1 ] * d[ i + 1 ] ]; // eslint-disable-line max-len
						re += ( off2[ 0 ] * xtrue[ k ][ 2 * ( i + 1 ) ] ) - ( off2[ 1 ] * xtrue[ k ][ ( 2 * ( i + 1 ) ) + 1 ] ); // eslint-disable-line max-len
						im += ( off2[ 0 ] * xtrue[ k ][ ( 2 * ( i + 1 ) ) + 1 ] ) + ( off2[ 1 ] * xtrue[ k ][ 2 * ( i + 1 ) ] ); // eslint-disable-line max-len
					}
					if ( i > 0 ) {
						// A(i,i-1) = conj(A(i-1,i)) * x(i-1)
						off2 = [ d[ i - 1 ] * off[ i - 1 ][ 0 ] * d[ i ], -d[ i - 1 ] * off[ i - 1 ][ 1 ] * d[ i ] ]; // eslint-disable-line max-len
						re += ( off2[ 0 ] * xtrue[ k ][ 2 * ( i - 1 ) ] ) - ( off2[ 1 ] * xtrue[ k ][ ( 2 * ( i - 1 ) ) + 1 ] ); // eslint-disable-line max-len
						im += ( off2[ 0 ] * xtrue[ k ][ ( 2 * ( i - 1 ) ) + 1 ] ) + ( off2[ 1 ] * xtrue[ k ][ 2 * ( i - 1 ) ] ); // eslint-disable-line max-len
					}
					ib = ( layouts[ o ] === 'column-major' ) ? i + ( k * N ) : ( i * nrhs ) + k; // eslint-disable-line max-len
					bv[ 2 * ib ] = re;
					bv[ ( 2 * ib ) + 1 ] = im;
				}
			}
			X = new Complex128Array( N * nrhs );
			FERR = new Float64Array( nrhs );
			BERR = new Float64Array( nrhs );
			rcond = new Float64Array( 1 );
			equed = [ 'none' ];
			if ( layouts[ o ] === 'column-major' ) {
				k = zpbsvx( 'column-major', 'equilibrate', uplos[ u ], N, 1, nrhs, AB, 2, new Complex128Array( 2 * N ), 2, equed, new Float64Array( N ), 1, B, N, X, N, rcond, FERR, 1, BERR, 1, null, null ); // eslint-disable-line max-len
			} else {
				k = zpbsvx( 'row-major', 'equilibrate', uplos[ u ], N, 1, nrhs, AB, N, new Complex128Array( 2 * N ), N, equed, new Float64Array( N ), 1, B, nrhs, X, nrhs, rcond, FERR, 1, BERR, 1, null, null ); // eslint-disable-line max-len
			}
			assert.equal( k, 0, 'info' );
			assert.equal( equed[ 0 ], 'yes', 'equed' );
			xv = reinterpret( X, 0 );
			for ( k = 0; k < nrhs; k++ ) {
				err = 0.0;
				xn = 0.0;
				for ( i = 0; i < N; i++ ) {
					ib = ( layouts[ o ] === 'column-major' ) ? i + ( k * N ) : ( i * nrhs ) + k; // eslint-disable-line max-len
					err = Math.max( err, Math.hypot( xv[ 2 * ib ] - xtrue[ k ][ 2 * i ], xv[ ( 2 * ib ) + 1 ] - xtrue[ k ][ ( 2 * i ) + 1 ] ) ); // eslint-disable-line max-len
					xn = Math.max( xn, Math.hypot( xv[ 2 * ib ], xv[ ( 2 * ib ) + 1 ] ) ); // eslint-disable-line max-len
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
