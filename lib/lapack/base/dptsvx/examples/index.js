import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptsvx from './../lib/index.js';

// Solve A_x = b where A is a 4x4 SPD tridiagonal matrix:
var d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
var e = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var df = new Float64Array( 4 );
var ef = new Float64Array( 3 );
var b = new Float64Array( [ 5.0, 8.0, 11.0, 10.0 ] );
var x = new Float64Array( 4 );
var rcond = new Float64Array( 1 );
var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Float64Array( 8 );

var info = dptsvx.ndarray( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'x:', x );
console.log( 'rcond:', rcond[ 0 ] );
console.log( 'ferr:', ferr );
console.log( 'berr:', berr );
