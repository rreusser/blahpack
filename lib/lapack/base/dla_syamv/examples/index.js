/* eslint-disable camelcase, stdlib/require-file-extensions */

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dla_syamv from '@stdlib/lapack/base/dla_syamv';

const opts = {
	'dtype': 'float64'
};

const N = 3;
const A = discreteUniform( N * N, -10, 10, opts );
const x = discreteUniform( N, -10, 10, opts );
const y = discreteUniform( N, -10, 10, opts );

dla_syamv( 'row-major', 'upper', N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
