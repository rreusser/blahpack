import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zheswapr from './../lib/index.js';

// Build a 4x4 Hermitian matrix (column-major) with real diagonal:
var A = new Complex128Array([
	1,
	0,
	2,
	1,
	3,
	2,
	4,
	3,
	2,
	-1,
	5,
	0,
	6,
	1,
	7,
	2,
	3,
	-2,
	6,
	-1,
	8,
	0,
	9,
	1,
	4,
	-3,
	7,
	-2,
	9,
	-1,
	10,
	0
]);

// Swap rows/columns 0 and 3, preserving the upper triangle:
zheswapr( 'column-major', 'upper', 4, A, 4, 0, 3 );

console.log( A ); // eslint-disable-line no-console
