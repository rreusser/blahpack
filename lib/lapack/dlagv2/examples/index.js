
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagv2 from './../lib/index.js';

// Define a 2x2 matrix A (column-major):
const csl = new Float64Array( 1 );
const snl = new Float64Array( 1 );
const csr = new Float64Array( 1 );
const snr = new Float64Array( 1 );

const A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );

// Define a 2x2 upper triangular matrix B (column-major):
const B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );

// Output arrays:
const alphar = new Float64Array( 2 );
const alphai = new Float64Array( 2 );
const beta = new Float64Array( 2 );

// Compute the Generalized Schur factorization:
dlagv2.strided( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0, csl, snl, csr, snr ); // eslint-disable-line max-len

console.log( 'CSL:', csl[ 0 ] ); // eslint-disable-line no-console
console.log( 'SNL:', snl[ 0 ] ); // eslint-disable-line no-console
console.log( 'CSR:', csr[ 0 ] ); // eslint-disable-line no-console
console.log( 'SNR:', snr[ 0 ] ); // eslint-disable-line no-console
