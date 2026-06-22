import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtbcon from './../lib/index.js';

// 4x4 upper triangular band matrix, kd=2:
// [ 10  -1   2   0 ]
// [  0   8  -2   1 ]
// [  0   0  12  -3 ]
// [  0   0   0   6 ]
// Column-major band storage (3 rows x 4 cols):
var AB = new Float64Array([
	0, 0, 10,  // col 1
	0, -1, 8,  // col 2
	2, -2, 12, // col 3
	1, -3, 6   // col 4
]);
var rcond = new Float64Array( 1 );
var WORK = new Float64Array( 12 );
var IWORK = new Int32Array( 4 );

var info = dtbcon( 'one-norm', 'upper', 'non-unit', 4, 2, AB, 3, rcond, WORK, IWORK );
console.log( 'info:', info );
console.log( 'rcond (one-norm):', rcond[ 0 ] );

info = dtbcon( 'inf-norm', 'upper', 'non-unit', 4, 2, AB, 3, rcond, WORK, IWORK );
console.log( 'rcond (inf-norm):', rcond[ 0 ] );
