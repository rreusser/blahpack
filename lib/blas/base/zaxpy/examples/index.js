import Float64Array from '@stdlib/array/float64/lib/index.js';
import zaxpy from './../lib/base.js';

// Perform y = alpha*x + y for complex vectors:
var zx = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var zy = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zaxpy( 2, alpha, zx, 1, 0, zy, 1, 0 );
console.log( zy ); // eslint-disable-line no-console
