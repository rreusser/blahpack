
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dhsein from './../lib/index.js';

// 3x3 upper-triangular Hessenberg matrix (column-major)
var N = 3;
var H = new Float64Array([
	1.0,
	0.0,
	0.0,  // column 0
	2.0,
	4.0,
	0.0,  // column 1
	3.0,
	5.0,
	6.0   // column 2
]);
var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
var WI = new Float64Array( N );

var SELECT = new Uint8Array( [ 1, 1, 1 ] );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var WORK = new Float64Array( ( N + 2 ) * N );
var IFAILL = new Int32Array( N );
var IFAILR = new Int32Array( N );

var res = dhsein.ndarray( 'right', 'no-source', 'no-init', SELECT, 1, 0, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, IFAILL, 1, 0, IFAILR, 1, 0 );
console.log( res ); // eslint-disable-line no-console
console.log( VR ); // eslint-disable-line no-console
