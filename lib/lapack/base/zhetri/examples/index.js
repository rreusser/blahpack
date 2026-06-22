import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetri from './../lib/index.js';

// 1x1 Hermitian matrix A = [4+0i], already factored (trivial 1x1 pivot):
var A = new Complex128Array( [ 4.0, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( 1 );
var Av = reinterpret( A, 0 );

var info = zhetri.ndarray( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
// => 0

console.log( 'A inverse:', Av[ 0 ], '+', Av[ 1 ], 'i' ); // eslint-disable-line no-console
// => 0.25 + 0 i
