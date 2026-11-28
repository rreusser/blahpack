
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from './../../dsptrf/lib/base.js';
import dsptrs from './../../dsptrs/lib/base.js';
import dsprfs from './../lib/base.js';

// 3x3 symmetric matrix [4 2 1; 2 5 3; 1 3 6] in upper packed storage:
const AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
const AFP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
const IPIV = new Int32Array( 3 );
const B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
const X = new Float64Array( [ 1.0, 2.0, 3.0 ] );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );
const WORK = new Float64Array( 9 );
const IWORK = new Int32Array( 3 );

// Factor the matrix:
dsptrf( 'upper', 3, AFP, 1, 0, IPIV, 1, 0 );

// Solve:
dsptrs( 'upper', 3, 1, AFP, 1, 0, IPIV, 1, 0, X, 1, 3, 0 );

// Refine solution and compute error bounds:
const info = dsprfs( 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'X:', X ); // eslint-disable-line no-console
console.log( 'FERR:', FERR ); // eslint-disable-line no-console
console.log( 'BERR:', BERR ); // eslint-disable-line no-console
