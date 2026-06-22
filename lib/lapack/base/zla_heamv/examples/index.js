
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaHeamv from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};

var N = 3;
var A = new Complex128Array( uniform( 2 * N * N, -10, 10, opts ) );
var x = new Complex128Array( uniform( 2 * N, -10, 10, opts ) );
var y = new Float64Array( N );

zlaHeamv( 'column-major', 'upper', N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
