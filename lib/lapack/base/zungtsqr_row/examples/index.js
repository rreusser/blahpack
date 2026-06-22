/* eslint-disable camelcase, stdlib/require-file-extensions */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatsqr from '@stdlib/lapack/base/zlatsqr';
import zungtsqr_row from '@stdlib/lapack/base/zungtsqr_row';

// Build a tall 6x2 column-major complex matrix.
var M = 6;
var N = 2;
var mb = 4;
var nb = 2;
var A = new Complex128Array( M * N );
var view = reinterpret( A, 0 );
var T;
var WORK;
var i;
var j;

for ( j = 0; j < N; j++ ) {
	for ( i = 0; i < M; i++ ) {
		view[ ( ( j * M ) + i ) * 2 ] = ( i === j ) ? ( 4.0 + j ) : ( 1.0 / ( Math.abs( i - j ) + 1 ) ); // eslint-disable-line max-len
		view[ ( ( ( j * M ) + i ) * 2 ) + 1 ] = 0.05 * ( i - j );
	}
}

// Compute V/T via blocked TSQR.
T = new Complex128Array( nb * N * Math.ceil( ( M - N ) / ( mb - N ) ) );
WORK = new Complex128Array( nb * N );
zlatsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );

// Generate the orthonormal Q.
WORK = new Complex128Array( Math.max( 1, nb * Math.max( nb, N - nb ) ) );
zungtsqr_row( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
