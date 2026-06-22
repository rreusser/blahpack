
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggevx from './../lib/index.js';

var N = 2;
var A = new Float64Array( [ 2.0, 0.0, 0.0, 5.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var ALPHAR = new Float64Array( N );
var ALPHAI = new Float64Array( N );
var BETA = new Float64Array( N );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );
var LSCALE = new Float64Array( N );
var RSCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( out ); // eslint-disable-line no-console
console.log( 'eigenvalue 0:', ALPHAR[ 0 ] / BETA[ 0 ] ); // eslint-disable-line no-console
console.log( 'eigenvalue 1:', ALPHAR[ 1 ] / BETA[ 1 ] ); // eslint-disable-line no-console
