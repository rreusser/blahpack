
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed6 from './../lib/index.js';

var d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
var z = new Float64Array( [ 0.3, 0.5, 0.8 ] );
var tau = new Float64Array( 1 );
var rho = 0.5;
var finit = rho + (z[0]/d[0]) + (z[1]/d[1]) + (z[2]/d[2]);

var info = dlaed6( 2, true, rho, d, z, finit, tau );
console.log( 'info:', info, 'tau:', tau[ 0 ] ); // eslint-disable-line no-console
