import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsyl from './../lib/index.js';

// 2x2 upper triangular complex matrices (A,D) and (B,E):
var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
var B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
var C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
var D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
var E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
var F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
var scale = new Float64Array( 1 );
var dif = new Float64Array( 1 );
var IWORK = new Int32Array( 10 );
var Cv;
var Fv;

var info = ztgsyl.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, dif, null, 1, 0, -1, IWORK, 1, 0 ); // eslint-disable-line max-len

Cv = reinterpret( C, 0 );
Fv = reinterpret( F, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'scale:', scale[ 0 ] ); // eslint-disable-line no-console
console.log( 'C (re/im):', Array.prototype.slice.call( Cv ) ); // eslint-disable-line no-console, max-len
console.log( 'F (re/im):', Array.prototype.slice.call( Fv ) ); // eslint-disable-line no-console, max-len
