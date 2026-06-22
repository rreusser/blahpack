import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpr2 from './../lib/base.js';

// Perform Hermitian packed rank-2 update:
var x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var AP = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zhpr2( 'upper', 2, alpha, x, 1, 0, y, 1, 0, AP, 1, 0 );
console.log( AP ); // eslint-disable-line no-console
