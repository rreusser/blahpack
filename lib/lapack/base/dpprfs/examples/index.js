
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpptrf from '../../dpptrf/lib/index.js';
import dpptrs from '../../dpptrs/lib/index.js';
import dpprfs from './../lib/index.js';

var IWORK;
var WORK;
var FERR;
var BERR;
var info;
var AFP;
var AP;
var X;
var B;

// 3x3 SPD matrix in upper packed storage: [ 4 2 1; 2 5 3; 1 3 6 ]
AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
AFP = new Float64Array( AP );

// Factorize
dpptrf.ndarray( 'upper', 3, AFP, 1, 0 );

// Right-hand side
B = new Float64Array( [ 1.0, 1.0, 1.0 ] );

// Solve
X = new Float64Array( B );
dpptrs.ndarray( 'upper', 3, 1, AFP, 1, 0, X, 1, 3, 0 );

// Refine solution
FERR = new Float64Array( 1 );
BERR = new Float64Array( 1 );
WORK = new Float64Array( 9 );
IWORK = new Int32Array( 3 );

info = dpprfs.ndarray( 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'X:', X ); // eslint-disable-line no-console
console.log( 'FERR:', FERR ); // eslint-disable-line no-console
console.log( 'BERR:', BERR ); // eslint-disable-line no-console
