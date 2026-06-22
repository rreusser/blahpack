import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspmv from './../lib/base.js';

// Perform y = alpha*A*x + beta*y for symmetric packed A:
var AP = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var x = new Float64Array( [ 1.0, 1.0 ] );
var y = new Float64Array( [ 0.0, 0.0 ] );

dspmv( 'upper', 2, 1.0, AP, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
