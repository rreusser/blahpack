
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetc2 from './../lib/index.js';

// 3x3 complex matrix (real-only entries) in column-major order:
const N = 3;
const A = new Complex128Array( N * N );
const view = reinterpret( A, 0 );
view[ 0 ] = 4.0; view[ 2 ] = 1.0; view[ 4 ] = 2.0; // column 0
view[ 6 ] = 1.0; view[ 8 ] = 5.0; view[ 10 ] = 1.0; // column 1
view[ 12 ] = 2.0; view[ 14 ] = 1.0; view[ 16 ] = 6.0; // column 2

const IPIV = new Int32Array( N );
const JPIV = new Int32Array( N );

const info = zgetc2( N, A, N, IPIV, 1, JPIV, 1 );
console.log( 'info =', info ); // eslint-disable-line no-console
console.log( 'IPIV =', IPIV ); // eslint-disable-line no-console
console.log( 'JPIV =', JPIV ); // eslint-disable-line no-console
