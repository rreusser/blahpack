import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspr2 from './../lib/base.js';

// Perform A = alpha*x*y' + alpha*y*x' + A:
var x = new Float64Array( [ 1.0, 2.0 ] );
var y = new Float64Array( [ 3.0, 4.0 ] );
var AP = new Float64Array( [ 1.0, 0.0, 1.0 ] );

dspr2( 'upper', 2, 1.0, x, 1, 0, y, 1, 0, AP, 1, 0 );
console.log( AP ); // eslint-disable-line no-console
