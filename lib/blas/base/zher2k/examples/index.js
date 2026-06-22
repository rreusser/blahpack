import Float64Array from '@stdlib/array/float64/lib/index.js';
import zher2k from './../lib/base.js';

// Perform Hermitian rank-2k update of C:
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var C = new Float64Array( 8 );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

zher2k( 'upper', 'no-transpose', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
console.log( C ); // eslint-disable-line no-console
