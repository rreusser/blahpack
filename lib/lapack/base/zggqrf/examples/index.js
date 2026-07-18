
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggqrf from './../lib/index.js';

// 1x1 case: A = (5+2i), B = (3-1i)
const A = new Complex128Array( [ 5, 2 ] );
const TAUA = new Complex128Array( 1 );
const B = new Complex128Array( [ 3, -1 ] );
const TAUB = new Complex128Array( 1 );
const WORK = new Complex128Array( 64 );

const info = zggqrf.ndarray( 1, 1, 1, A, 1, 1, 0, TAUA, 1, 0, B, 1, 1, 0, TAUB, 1, 0, WORK, 1, 0, 64 ); // eslint-disable-line max-len
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'A:', reinterpret( A, 0 ) ); // eslint-disable-line no-console
console.log( 'B:', reinterpret( B, 0 ) ); // eslint-disable-line no-console
