
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaed6 from './../lib/index.js';

const d = new Float64Array( [ 1.0, 3.0, 7.0 ] );
const z = new Float64Array( [ 0.3, 0.5, 0.8 ] );
const tau = new Float64Array( 1 );
const rho = 0.5;
const finit = rho + (z[0]/d[0]) + (z[1]/d[1]) + (z[2]/d[2]);

const info = dlaed6( 2, true, rho, d, z, finit, tau );
console.log( 'info:', info, 'tau:', tau[ 0 ] ); // eslint-disable-line no-console
