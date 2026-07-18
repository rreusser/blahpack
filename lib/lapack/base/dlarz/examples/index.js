import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarz from './../lib/index.js';

const opts = {
	'dtype': 'float64'
};

const M = 4;
const N = 4;
const L = 2;
const tau = 0.5;
const v = discreteUniform( L, -5, 5, opts );
const C = discreteUniform( M * N, -10, 10, opts );
const WORK = new Float64Array( N );

dlarz( 'column-major', 'left', M, N, L, v, 1, tau, C, M, WORK, 1 );
console.log( C ); // eslint-disable-line no-console
