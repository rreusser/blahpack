import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zppsvx from './../lib/index.js';

// 3x3 Hermitian positive definite matrix in upper packed storage.

// A = [10  3-i  1+2i;  3+i  8  2-i;  1-2i  2+i  6]
var AP = new Complex128Array( new Float64Array( [ 10, 0, 3, -1, 8, 0, 1, 2, 2, -1, 6, 0 ] ) ); // eslint-disable-line max-len
var AFP = new Complex128Array( 6 );
var S = new Float64Array( 3 );
var equed = [ 'none' ];
var B = new Complex128Array( new Float64Array( [ 1, 1, 2, -1, 3, 0.5 ] ) );
var X = new Complex128Array( 3 );
var rcond = new Float64Array( 1 );
var FERR = new Float64Array( 1 );
var BERR = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = zppsvx.ndarray( 'not-factored', 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'X:', reinterpret( X, 0 ) ); // eslint-disable-line no-console
console.log( 'rcond:', rcond[ 0 ] ); // eslint-disable-line no-console
console.log( 'FERR:', FERR[ 0 ] ); // eslint-disable-line no-console
console.log( 'BERR:', BERR[ 0 ] ); // eslint-disable-line no-console
