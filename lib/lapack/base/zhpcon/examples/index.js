import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhpcon from './../lib/index.js';

// 3x3 identity in upper packed format (already factored, trivial pivots)
var AP = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] ); // eslint-disable-line max-len
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var rcond = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );

var info = zhpcon.ndarray( 'upper', 3, AP, 1, 0, IPIV, 1, 0, 1.0, rcond, WORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info );
// => info: 0

console.log( 'rcond:', rcond[ 0 ] );
// => rcond: 1
