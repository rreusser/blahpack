
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dlaqtr from '@stdlib/lapack/base/dlaqtr';

const opts = {
	'dtype': 'float64'
};

const M = 3;
const N = 3;
const A = discreteUniform( M * N, -10, 10, opts );
const B = discreteUniform( M * N, -10, 10, opts );
const C = discreteUniform( M * N, -10, 10, opts );

// TODO: Adjust call to match the specific routine signature
dlaqtr( 'row-major', M, N, 1.0, A, N, B, N, 0.0, C, N );
console.log( C ); // eslint-disable-line no-console
