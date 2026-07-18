/* eslint-disable camelcase, stdlib/require-file-extensions */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaorhr_col_getrfnp from '@stdlib/lapack/base/dlaorhr_col_getrfnp';

const M = 3;
const N = 3;

const A = new Float64Array( [ 0.5, 0.3, -0.2, -0.4, 0.6, 0.1, 0.2, -0.1, 0.7 ] );
const D = new Float64Array( 3 );

dlaorhr_col_getrfnp( 'column-major', M, N, A, M, D, 1 );
console.log( A ); // eslint-disable-line no-console
console.log( D ); // eslint-disable-line no-console
