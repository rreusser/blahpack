import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggevx from './../lib/index.js';

var N = 2;

// Column-major diagonal pair: eigenvalues 2 and 2.
var A = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
var B = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
var ALPHA = new Complex128Array( N );
var BETA = new Complex128Array( N );
var VL = new Complex128Array( N * N );
var VR = new Complex128Array( N * N );
var LSCALE = new Float64Array( N );
var RSCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var r = zggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, B, N, ALPHA, 1, BETA, 1, VL, N, VR, N, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( r ); // eslint-disable-line no-console
