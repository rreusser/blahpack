
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlacrt from './../lib/index.js';

var cx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var cy = new Complex128Array( [ 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
var c = new Complex128( 0.6, 0.1 );
var s = new Complex128( 0.8, 0.2 );

zlacrt.ndarray( 3, cx, 1, 0, cy, 1, 0, c, s );

console.log( 'cx:', cx );
console.log( 'cy:', cy );
