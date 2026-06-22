
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggev from './../lib/index.js';

// Compute generalized eigenvalues of a 3x3 matrix pair (A, B):
var N = 3;

// Column-major matrices:
var A = new Float64Array( [ 1, 4, 7, 2, 5, 8, 3, 6, 10 ] );
var B = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );

var ALPHAR = new Float64Array( N );
var ALPHAI = new Float64Array( N );
var BETA = new Float64Array( N );
var VL = new Float64Array( 1 );
var VR = new Float64Array( N * N );

var info = dggev( 'column-major', 'no-vectors', 'compute-vectors', N, A, N, B, N, ALPHAR, ALPHAI, BETA, VL, 1, VR, N );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'eigenvalues (alphar/beta):', ALPHAR[ 0 ] / BETA[ 0 ], ALPHAR[ 1 ] / BETA[ 1 ], ALPHAR[ 2 ] / BETA[ 2 ] ); // eslint-disable-line no-console
