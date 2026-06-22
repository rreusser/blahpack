
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlargv from './../lib/index.js';

var x = new Complex128Array( [ 3.0, 1.0, 1.0, 2.0 ] );
var y = new Complex128Array( [ 4.0, 0.0, 3.0, 1.0 ] );
var c = new Float64Array( 2 );

zlargv.ndarray( 2, x, 1, 0, y, 1, 0, c, 1, 0 );

console.log( 'cosines:', c );
console.log( 'x (r):', reinterpret( x, 0 ) );
console.log( 'y (sines):', reinterpret( y, 0 ) );
