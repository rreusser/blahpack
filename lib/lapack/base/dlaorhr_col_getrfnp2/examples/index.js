/* eslint-disable camelcase, stdlib/require-file-extensions */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaorhr_col_getrfnp2 from '@stdlib/lapack/base/dlaorhr_col_getrfnp2';

var M = 3;
var N = 3;

var A = new Float64Array( [ 0.5, 0.3, -0.2, -0.4, 0.6, 0.1, 0.2, -0.1, 0.7 ] );
var D = new Float64Array( 3 );

dlaorhr_col_getrfnp2( 'column-major', M, N, A, M, D, 1 );
console.log( A ); // eslint-disable-line no-console
console.log( D ); // eslint-disable-line no-console
