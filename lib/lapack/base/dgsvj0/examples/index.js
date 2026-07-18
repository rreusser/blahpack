

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj0 from './../lib/index.js';

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;

// Construct a 4x3 matrix `A` (column-major) whose columns are not orthogonal:
const M = 4;
const N = 3;
let A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );

// Initialize the column-scale array `d` to all ones (no pre-scaling):
let d = new Float64Array( [ 1.0, 1.0, 1.0 ] );

// Compute initial scaled column norms:
let sva = new Float64Array( N );
let i, j, s;
for ( j = 0; j < N; j++ ) {
	s = 0.0;
	for ( i = 0; i < M; i++ ) {
		s += A[ ( j * M ) + i ] * A[ ( j * M ) + i ];
	}
	sva[ j ] = Math.sqrt( s );
}

// Run one Jacobi sweep without accumulating right singular vectors. The
// wrapper requires `LDV >= max(1,M)`, so allocate a dummy column for `V`:
let V = new Float64Array( M );
let work = new Float64Array( M );
let info = dgsvj0( 'column-major', 'no-v', M, N, A, M, d, 1, sva, 1, 0, V, M, EPS, SFMIN, TOL, 5, work, 1, M );

console.log( 'info =', info );
console.log( 'sva =', sva );

// Using the ndarray interface (offsets, arbitrary strides):
A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
d = new Float64Array( [ 1.0, 1.0, 1.0 ] );
sva = new Float64Array( N );
for ( j = 0; j < N; j++ ) {
	s = 0.0;
	for ( i = 0; i < M; i++ ) {
		s += A[ ( j * M ) + i ] * A[ ( j * M ) + i ];
	}
	sva[ j ] = Math.sqrt( s );
}
V = new Float64Array( 1 );
work = new Float64Array( M );
info = dgsvj0.ndarray( 'no-v', M, N, A, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0, M );

console.log( 'info =', info );
console.log( 'sva =', sva );
