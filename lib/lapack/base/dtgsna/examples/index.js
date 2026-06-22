
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtgsna from './../lib/index.js';

var N = 3;
var A = new Float64Array( N * N );
var B = new Float64Array( N * N );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var s = new Float64Array( N );
var DIF = new Float64Array( N );
var WORK = new Float64Array( ( 2 * N * ( N + 2 ) ) + 16 );
var IWORK = new Int32Array( N + 6 );
var SELECT = new Uint8Array( N );
var M = new Int32Array( 1 );

A[ 0 ] = 1.0;
A[ 3 ] = 0.5;
A[ 4 ] = 2.0;
A[ 6 ] = 0.3;
A[ 7 ] = 0.4;
A[ 8 ] = 3.0;

B[ 0 ] = 1.0;
B[ 3 ] = 0.2;
B[ 4 ] = 1.5;
B[ 6 ] = 0.1;
B[ 7 ] = 0.3;
B[ 8 ] = 2.0;

VL[ 0 ] = 1.0;
VL[ 4 ] = 1.0;
VL[ 8 ] = 1.0;
VR[ 0 ] = 1.0;
VR[ 4 ] = 1.0;
VR[ 8 ] = 1.0;

dtgsna.ndarray( 'both', 'all', SELECT, 1, 0, N, A, 1, N, 0, B, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, DIF, 1, 0, N, M, WORK, 1, 0, WORK.length, IWORK, 1, 0 );

console.log( 's =', s ); // eslint-disable-line no-console
console.log( 'DIF =', DIF ); // eslint-disable-line no-console
console.log( 'M =', M[ 0 ] ); // eslint-disable-line no-console
