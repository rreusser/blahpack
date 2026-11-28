/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbsvx from './../lib/dgbsvx.js';


// TESTS //

test( 'dgbsvx is a function', function t() {
	assert.strictEqual( typeof dgbsvx, 'function', 'is a function' );
});

test( 'dgbsvx has expected arity', function t() {
	assert.strictEqual( dgbsvx.length, 29, 'has expected arity' );
});

test( 'dgbsvx throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		dgbsvx( 'column-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgbsvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		dgbsvx( 'column-major', 'equilibrate', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgbsvx throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		const rcond = new Float64Array( 1 );
		dgbsvx( 'column-major', 'equilibrate', 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, rcond, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgbsvx: row-major and column-major layouts give the same solution (equilibrate, transpose, 2 RHS)', function t() { // eslint-disable-line max-len
	// 4x4 band matrix, KL=1, KU=1, badly scaled rows so that EQUED != 'none':
	const dense = [
		[ 4e-3, 1e-3, 0, 0 ],
		[ 2, 5, 1, 0 ],
		[ 0, 1e3, 6e3, 2e3 ],
		[ 0, 0, 1, 7 ]
	];
	const N = 4;
	const nrhs = 2;
	const kl = 1;
	const ku = 1;
	const nb = kl + ku + 1;
	const nf = ( 2 * kl ) + ku + 1;
	const xtrue = [ [ 1, -2, 3, -4 ], [ 0.5, 0.25, -1, 2 ] ];
	const out = {};
	const layouts = [ 'column-major', 'row-major' ];
	let rcond;
	let equed;
	let err;
	let xn;
	let info;
	let FERR;
	let BERR;
	let AB;
	let B;
	let X;
	let s;
	let i;
	let j;
	let k;
	let o;
	for ( o = 0; o < layouts.length; o++ ) {
		AB = new Float64Array( nb * N );
		B = new Float64Array( N * nrhs );
		for ( j = 0; j < N; j++ ) {
			for ( i = Math.max( 0, j - ku ); i <= Math.min( N - 1, j + kl ); i++ ) {
				if ( layouts[ o ] === 'column-major' ) {
					AB[ ( ku + i - j ) + ( j * nb ) ] = dense[ i ][ j ];
				} else {
					AB[ ( ( ku + i - j ) * N ) + j ] = dense[ i ][ j ];
				}
			}
		}
		// B = A^T * xtrue:
		for ( k = 0; k < nrhs; k++ ) {
			for ( i = 0; i < N; i++ ) {
				s = 0.0;
				for ( j = 0; j < N; j++ ) {
					s += dense[ j ][ i ] * xtrue[ k ][ j ];
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
			info = dgbsvx( 'column-major', 'equilibrate', 'transpose', N, kl, ku, nrhs, AB, nb, new Float64Array( nf * N ), nf, new Int32Array( N ), 1, equed, new Float64Array( N ), 1, new Float64Array( N ), 1, B, N, X, N, rcond, FERR, 1, BERR, 1, null, null ); // eslint-disable-line max-len
		} else {
			info = dgbsvx( 'row-major', 'equilibrate', 'transpose', N, kl, ku, nrhs, AB, N, new Float64Array( nf * N ), N, new Int32Array( N ), 1, equed, new Float64Array( N ), 1, new Float64Array( N ), 1, B, nrhs, X, nrhs, rcond, FERR, 1, BERR, 1, null, null ); // eslint-disable-line max-len
		}
		assert.equal( info, 0, layouts[ o ] + ': info' );
		assert.notEqual( equed[ 0 ], 'none', layouts[ o ] + ': equilibrated' );
		for ( k = 0; k < nrhs; k++ ) {
			err = 0.0;
			xn = 0.0;
			for ( i = 0; i < N; i++ ) {
				s = X[ ( layouts[ o ] === 'column-major' ) ? i + ( k * N ) : ( i * nrhs ) + k ]; // eslint-disable-line max-len
				err = Math.max( err, Math.abs( s - xtrue[ k ][ i ] ) );
				xn = Math.max( xn, Math.abs( s ) );
			}
			assert.ok( err / xn <= FERR[ k ], layouts[ o ] + ': FERR bounds the forward error' ); // eslint-disable-line max-len
			assert.ok( err / xn <= 1e-9, layouts[ o ] + ': X solves A^T*X = B' );
			assert.ok( BERR[ k ] <= 1e-15, layouts[ o ] + ': BERR' );
		}
		out[ layouts[ o ] ] = {
			'rcond': rcond[ 0 ],
			'equed': equed[ 0 ],
			'FERR': Array.from( FERR )
		};
	}
	assert.deepEqual( out[ 'row-major' ], out[ 'column-major' ], 'layout invariance' ); // eslint-disable-line max-len
});
