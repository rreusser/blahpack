import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormr3 from './../lib/index.js';

// Set up a tiny synthetic problem with K=2 reflectors, L=1 trailing

// Element each, applied to a 3x3 identity matrix from the left:
var A = new Float64Array([
	// Row-major: K=2 rows x (LDA=N=3) columns
	0.0,
	0.0,
	0.5,   // reflector 1: z = [0.5]
	0.0,
	0.0,
	0.25   // reflector 2: z = [0.25]
]);
var TAU = new Float64Array([ 0.8, 1.1 ]);
var C = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	1.0
]);
var WORK = new Float64Array( 3 );

dormr3( 'row-major', 'left', 'no-transpose', 3, 3, 2, 1, A, 3, TAU, 1, C, 3, WORK, 1 );
console.log( C ); // eslint-disable-line no-console
