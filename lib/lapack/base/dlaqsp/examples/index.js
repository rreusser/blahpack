import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsp from './../lib/index.js';

// 3x3 symmetric matrix (upper packed):
var AP = new Float64Array( [ 4.0, 1.0, 9.0, 0.5, 2.0, 16.0 ] );
var S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );

// Poor scond triggers equilibration:
var equed = dlaqsp( 'upper', 3, AP, S, 1, 0.05, 16.0 );

console.log( 'equed:', equed );
// => 'yes'

console.log( 'AP:', AP );
