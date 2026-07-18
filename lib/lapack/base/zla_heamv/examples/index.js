
import uniform from '@stdlib/random/array/uniform/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaHeamv from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};

const N = 3;
const A = new Complex128Array( uniform( 2 * N * N, -10, 10, opts ) );
const x = new Complex128Array( uniform( 2 * N, -10, 10, opts ) );
const y = new Float64Array( N );

zlaHeamv( 'column-major', 'upper', N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
