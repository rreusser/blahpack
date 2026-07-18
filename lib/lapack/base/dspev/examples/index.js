import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspev from './../lib/index.js';

// 3x3 symmetric matrix [[5,1,2],[1,4,1],[2,1,6]] in lower packed storage:
const AP = new Float64Array( [ 5.0, 1.0, 2.0, 4.0, 1.0, 6.0 ] );
const w = new Float64Array( 3 );
const Z = new Float64Array( 9 );
const WORK = new Float64Array( 9 );

dspev.ndarray( 'compute-vectors', 'lower', 3, AP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 );

console.log( 'eigenvalues:', w ); // eslint-disable-line no-console
console.log( 'eigenvectors (column-major):', Z ); // eslint-disable-line no-console
