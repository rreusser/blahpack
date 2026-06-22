import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotmg from './../lib/base.js';

// Generate modified Givens rotation parameters:
var D = new Float64Array( [ 1.0, 1.0 ] );
var x1 = new Float64Array( [ 3.0 ] );
var param = new Float64Array( 5 );

drotmg( D, 1, 0, x1, 1, 0, 4.0, param, 1, 0 );
console.log( param ); // eslint-disable-line no-console
