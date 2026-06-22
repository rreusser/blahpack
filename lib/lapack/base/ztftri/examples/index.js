
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztftri from './../lib/index.js';

// 3x3 lower triangular matrix in RFP format (TRANSR='N', UPLO='L'):
var a = new Complex128Array([
	2.0,
	1.0,
	0.5,
	-0.3,
	1.0,
	0.5,
	4.0,
	0.0,
	3.0,
	-1.0,
	0.8,
	0.2
]);

var info = ztftri.ndarray( 'no-transpose', 'lower', 'non-unit', 3, a, 1, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
