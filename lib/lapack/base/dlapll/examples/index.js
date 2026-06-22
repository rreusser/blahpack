import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapll from './../lib/index.js';

// Parallel vectors (linearly dependent):
var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var y = new Float64Array( [ 2.0, 4.0, 6.0, 8.0 ] );
var ssmin = new Float64Array( 1 );

dlapll( 4, x, 1, y, 1, ssmin );
console.log( 'Parallel vectors, ssmin:', ssmin[ 0 ] );
// => ~0.0

// Orthogonal vectors (linearly independent):
x = new Float64Array( [ 1.0, 0.0, 0.0 ] );
y = new Float64Array( [ 0.0, 1.0, 0.0 ] );
ssmin = new Float64Array( 1 );

dlapll( 3, x, 1, y, 1, ssmin );
console.log( 'Orthogonal vectors, ssmin:', ssmin[ 0 ] );
// => 1.0

// General vectors:
x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
y = new Float64Array( [ 4.0, 5.0, 6.0 ] );
ssmin = new Float64Array( 1 );

dlapll( 3, x, 1, y, 1, ssmin );
console.log( 'General vectors, ssmin:', ssmin[ 0 ] );
// => ~0.773
