import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpev from './../lib/index.js';

// 3x3 Hermitian matrix [[5,1-i,2+i],[1+i,4,1],[2-i,1,6]] in lower packed storage:
const AP = new Complex128Array( [ 5, 0, 1, 1, 2, -1, 4, 0, 1, 0, 6, 0 ] );
const w = new Float64Array( 3 );
const Z = new Complex128Array( 9 );
const WORK = new Complex128Array( 10 );
const RWORK = new Float64Array( 10 );

zhpev.ndarray( 'compute-vectors', 'lower', 3, AP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'eigenvalues:', w ); // eslint-disable-line no-console
