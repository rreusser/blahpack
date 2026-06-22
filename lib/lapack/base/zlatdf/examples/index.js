
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetc2 from './../../zgetc2/lib/index.js';
import zlatdf from './../lib/index.js';

// Build a 2x2 complex matrix and factor it via zgetc2 to obtain the LU
// representation that zlatdf operates on:
var N = 2;
var Z = new Complex128Array( N * N );
var view = reinterpret( Z, 0 );
view[ 0 ] = 4.0; view[ 2 ] = 1.0; // column 0: (4, 1)
view[ 4 ] = 1.0; view[ 6 ] = 3.0; // column 1: (1, 3)

var IPIV = new Int32Array( N );
var JPIV = new Int32Array( N );
zgetc2( N, Z, N, IPIV, 1, JPIV, 1 );

// zlatdf accumulates a contribution to the reciprocal Dif-estimate. ijob=2
// uses the zgecon-style approximation; ijob=5 uses the local look-ahead.
var RHS = new Complex128Array( N );
var rhsView = reinterpret( RHS, 0 );
rhsView[ 0 ] = 1.0;
rhsView[ 2 ] = 1.0;

var out = zlatdf( 2, N, Z, N, RHS, 1, 0.0, 1.0, IPIV, 1, JPIV, 1 );
console.log( 'rdsum =', out.rdsum, 'rdscal =', out.rdscal ); // eslint-disable-line no-console
