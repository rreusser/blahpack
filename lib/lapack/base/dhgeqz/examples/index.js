
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhgeqz from './../lib/index.js';

// 2x2 upper Hessenberg H and upper triangular T:
var H = new Float64Array( [ 2.0, 3.0, 1.5, 4.0 ] );
var T = new Float64Array( [ 1.0, 0.5, 0.0, 2.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var Q = new Float64Array( 4 );
var Z = new Float64Array( 4 );
var WORK = new Float64Array( 10 );

var info = dhgeqz.ndarray( 'eigenvalues', 'none', 'none', 2, 0, 1, H, 2, 1, 0, T, 2, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, Q, 2, 1, 0, Z, 2, 1, 0, WORK, 1, 0, 2);

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'ALPHAR:', ALPHAR ); // eslint-disable-line no-console
console.log( 'ALPHAI:', ALPHAI ); // eslint-disable-line no-console
console.log( 'BETA:', BETA ); // eslint-disable-line no-console
