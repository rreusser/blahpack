import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsb from './../lib/index.js';

// 4x4 symmetric band matrix (upper, KD=1, LDAB=2):
const AB = new Float64Array( [ 0.0, 4.0, 1.0, 9.0, 2.0, 16.0, 3.0, 25.0 ] ); // eslint-disable-line max-len
const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );

// Poor scond triggers equilibration:
const equed = [ '' ];
dlaqsb.strided( 'upper', 4, 1, AB, 1, 2, 0, S, 1, 0, 0.02, 25.0, equed );

console.log( 'equed:', equed[ 0 ] ); // eslint-disable-line no-console
// => 'yes'

console.log( 'AB:', AB ); // eslint-disable-line no-console
