import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zupmtr from './../lib/index.js';

var WORK;
var info;
var TAU;
var AP;
var cv;
var C;

// Create a 4x4 complex identity matrix:
C = new Complex128Array( 16 );
cv = reinterpret( C, 0 );
cv[ 0 ] = 1.0;
cv[ 10 ] = 1.0;
cv[ 20 ] = 1.0;
cv[ 30 ] = 1.0;

// Packed reflectors and tau (would normally come from zhptrd):
AP = new Complex128Array( 10 );
TAU = new Complex128Array( 3 );
WORK = new Complex128Array( 4 );

info = zupmtr.ndarray( 'left', 'upper', 'no-transpose', 4, 4, AP, 1, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'C (interleaved re/im):', reinterpret( C, 0 ) ); // eslint-disable-line no-console
