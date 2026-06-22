
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarnv from './../lib/index.js';

var iseed;
var xv;
var x;
var i;

iseed = new Int32Array( [ 1, 2, 3, 4 ] );
x = new Complex128Array( 5 );

zlarnv.ndarray( 1, iseed, 1, 0, 5, x, 1, 0 );

xv = reinterpret( x, 0 );
for ( i = 0; i < 5; i += 1 ) {
	console.log( 'x[%d] = %d + %di', i, xv[ 2 * i ], xv[ (2 * i) + 1 ] ); // eslint-disable-line no-console
}
