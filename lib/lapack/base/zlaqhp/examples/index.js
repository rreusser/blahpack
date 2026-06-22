import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqhp from './../lib/index.js';

var AP;
var AP2;
var S;
var S2;
var equed;
var equed2;

// 3x3 Hermitian packed upper: A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
AP = new Complex128Array( [ 4.0, 0.0, 1.0, 2.0, 9.0, 0.0, 0.5, -1.0, 2.0, 0.5, 16.0, 0.0 ] ); // eslint-disable-line max-len
S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );

equed = zlaqhp( 'upper', 3, AP, S, 1, 0.05, 16.0 );
console.log( 'equed:', equed ); // eslint-disable-line no-console
// => equed: yes

// No equilibration needed (good scaling):
AP2 = new Complex128Array( [ 4.0, 0.0, 1.0, 1.0, 9.0, 0.0 ] );
S2 = new Float64Array( [ 1.0, 1.0 ] );

equed2 = zlaqhp( 'upper', 2, AP2, S2, 1, 1.0, 9.0 );
console.log( 'equed:', equed2 ); // eslint-disable-line no-console
// => equed: none
