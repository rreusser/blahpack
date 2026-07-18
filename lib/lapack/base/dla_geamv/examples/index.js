/* eslint-disable camelcase, stdlib/require-file-extensions */

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dla_geamv from '@stdlib/lapack/base/dla_geamv';

const opts = {
	'dtype': 'float64'
};

const M = 3;
const N = 3;
const A = discreteUniform( M * N, -10, 10, opts );
const x = discreteUniform( N, -10, 10, opts );
const y = discreteUniform( M, -10, 10, opts );

dla_geamv( 'row-major', 'no-transpose', M, N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
