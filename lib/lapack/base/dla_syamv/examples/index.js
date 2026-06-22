/* eslint-disable camelcase, stdlib/require-file-extensions */

import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dla_syamv from '@stdlib/lapack/base/dla_syamv';

var opts = {
	'dtype': 'float64'
};

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );

dla_syamv( 'row-major', 'upper', N, 1.0, A, N, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
