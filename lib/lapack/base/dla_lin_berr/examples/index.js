/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaLinBerr from './../lib/index.js';

var N = 3;
var nrhs = 2;

// Residual matrix R (column-major, 3 x 2):
var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6, 5e-6, 6e-6 ] );

// Denominator |op(A_s)|*|Y| + |B_s| (column-major, 3 x 2):
var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );

var berr = new Float64Array( nrhs );

dlaLinBerr( N, N, nrhs, res, N, ayb, N, berr );

console.log( berr ); // eslint-disable-line no-console
