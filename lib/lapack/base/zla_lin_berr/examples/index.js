import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaLinBerr from './../lib/index.js';

const N = 3;
const NRHS = 2;

// Complex residual (N × NRHS), column-major:
const res = new Complex128Array([
	1.0e-10,
	2.0e-10,
	-3.0e-10,
	4.0e-10,
	5.0e-10,
	-6.0e-10,
	7.0e-10,
	-8.0e-10,
	9.0e-10,
	1.0e-10,
	-2.0e-10,
	3.0e-10
]);

// Real denominator |op(A)|*|y| + |b|:
const ayb = new Float64Array([ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ]);

// Output backward error per RHS:
const berr = new Float64Array( NRHS );

zlaLinBerr.ndarray( N, N, NRHS, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
console.log( berr ); // eslint-disable-line no-console
