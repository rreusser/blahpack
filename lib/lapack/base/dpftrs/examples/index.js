
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftrf from '@stdlib/lapack/base/dpftrf';
import dpftrs from './../lib/index.js';

// 3x3 SPD matrix in RFP format (TRANSR='no-transpose', UPLO='lower'):
var A = new Float64Array( [ 10, 3, 1, 6, 8, 2 ] );
dpftrf.ndarray( 'no-transpose', 'lower', 3, A, 1, 0 );

var B = new Float64Array( [ 33.0, 38.0, 32.0 ] );
var info = dpftrs.ndarray( 'no-transpose', 'lower', 3, 1, A, 1, 0, B, 1, 3, 0 );
console.log( 'info:', info );
// => info: 0

console.log( 'Solution:', B );
// => Solution: Float64Array [ ~2.0, ~3.0, ~4.0 ]
