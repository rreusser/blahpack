import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsb from './../lib/index.js';

// 4x4 symmetric band matrix (upper, KD=1, LDAB=2):
var AB = new Float64Array( [ 0.0, 4.0, 1.0, 9.0, 2.0, 16.0, 3.0, 25.0 ] ); // eslint-disable-line max-len
var S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );

// Poor scond triggers equilibration:
var equed = dlaqsb( 'upper', 4, 1, AB, 2, S, 1, 0.02, 25.0 );

console.log( 'equed:', equed ); // eslint-disable-line no-console
// => 'yes'

console.log( 'AB:', AB ); // eslint-disable-line no-console
