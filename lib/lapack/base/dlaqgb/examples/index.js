
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqgb from './../lib/index.js';

// 4x5 band matrix, KL=1, KU=2, LDAB=4 (band storage):
var AB = new Float64Array([
	0.0,
	0.0,
	2.0,
	1.5,
	0.0,
	3.0,
	1.0,
	0.5,
	0.8,
	2.5,
	4.0,
	1.2,
	0.6,
	3.5,
	2.0,
	0.0,
	1.0,
	0.7,
	0.0,
	0.0
]);

var r = new Float64Array( [ 0.5, 1.0, 0.8, 0.25 ] );
var c = new Float64Array( [ 0.6, 1.0, 0.7, 0.9, 0.4 ] );

// Apply both row and column equilibration:
var equed = dlaqgb.ndarray( 4, 5, 1, 2, AB, 1, 4, 0, r, 1, 0, c, 1, 0, 0.01, 0.01, 4.0 ); // eslint-disable-line max-len

console.log( 'equed:', equed );
// => 'both'
console.log( 'AB:', AB );
