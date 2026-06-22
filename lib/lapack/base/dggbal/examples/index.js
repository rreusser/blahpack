
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbal from './../lib/index.js';

var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var WORK = new Float64Array( 12 );

var result = dggbal.ndarray( 'both', 2, A, 1, 2, 0, B, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', result.info ); // eslint-disable-line no-console
console.log( 'ilo:', result.ilo );   // eslint-disable-line no-console
console.log( 'ihi:', result.ihi );   // eslint-disable-line no-console
