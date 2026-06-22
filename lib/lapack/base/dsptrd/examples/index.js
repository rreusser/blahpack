import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsptrd from './../lib/index.js';

// 3x3 symmetric matrix [[2,3,1],[3,5,4],[1,4,8]] in upper packed storage:
var AP = new Float64Array( [ 2.0, 3.0, 5.0, 1.0, 4.0, 8.0 ] );
var d = new Float64Array( 3 );
var e = new Float64Array( 2 );
var tau = new Float64Array( 2 );

dsptrd.ndarray( 'upper', 3, AP, 1, 0, d, 1, 0, e, 1, 0, tau, 1, 0 );

console.log( 'd (diagonal):', d ); // eslint-disable-line no-console
console.log( 'e (off-diagonal):', e ); // eslint-disable-line no-console
console.log( 'tau (reflector scalars):', tau ); // eslint-disable-line no-console
