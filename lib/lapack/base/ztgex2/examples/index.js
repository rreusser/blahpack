
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgex2 from './../lib/index.js';

// 2x2 upper triangular pair (A,B) in column-major order:
var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

// Swap the two diagonal blocks at position j1=0:
var info = ztgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0 );

var Av = reinterpret( A, 0 );
var Bv = reinterpret( B, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'A(1,1):', Av[ 0 ], '+', Av[ 1 ], 'i' ); // eslint-disable-line no-console
console.log( 'A(2,2):', Av[ 6 ], '+', Av[ 7 ], 'i' ); // eslint-disable-line no-console
console.log( 'B(1,1):', Bv[ 0 ], '+', Bv[ 1 ], 'i' ); // eslint-disable-line no-console
console.log( 'B(2,2):', Bv[ 6 ], '+', Bv[ 7 ], 'i' ); // eslint-disable-line no-console
