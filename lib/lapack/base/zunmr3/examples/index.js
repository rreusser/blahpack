import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zunmr3 from './../lib/index.js';

var A = new Complex128Array( 6 );
var TAU = new Complex128Array( 2 );
var C = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );

zunmr3( 'column-major', 'left', 'no-transpose', 3, 3, 2, 0, A, 2, TAU, 1, C, 3, WORK, 1 );
console.log( C ); // eslint-disable-line no-console
