import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbsv from './../lib/base.js';

// Solve A*x = b for triangular banded A:
var A = new Float64Array( [ 0.0, 2.0, 0.0, 3.0 ] );
var x = new Float64Array( [ 4.0, 9.0 ] );

dtbsv( 'upper', 'no-transpose', 'non-unit', 2, 1, A, 2, 1, 0, x, 1, 0 );
console.log( x ); // eslint-disable-line no-console
