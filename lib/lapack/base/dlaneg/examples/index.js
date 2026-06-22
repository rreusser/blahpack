import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaneg from './../lib/index.js';

// Build a simple positive-definite tridiagonal L*D*L^T with D[i] > 0:
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
var LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );

// Count eigenvalues below sigma = 0 (should be 0 for this positive-definite example):
var negcnt = dlaneg( 5, d, 1, LLD, 1, 0.0, 1.0e-30, 3 );
console.log( 'Sturm count (sigma=0): %d', negcnt ); // eslint-disable-line no-console

// Count eigenvalues below sigma = 10 (should be 5 since all eigenvalues are below 10):
negcnt = dlaneg( 5, d, 1, LLD, 1, 10.0, 1.0e-30, 3 );
console.log( 'Sturm count (sigma=10): %d', negcnt ); // eslint-disable-line no-console
