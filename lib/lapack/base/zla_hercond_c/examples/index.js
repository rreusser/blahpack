
/* eslint-disable camelcase */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zla_hercond_c from './../lib/base.js';

const N = 3;
const A = new Complex128Array([
	// Column 1 of a 3x3 Hermitian matrix
	2.0,
	0.0,
	1.0,
	-1.0,
	0.0,
	1.0,

	// Column 2
	1.0,
	1.0,
	-3.0,
	0.0,
	2.0,
	-0.5,

	// Column 3
	0.0,
	-1.0,
	2.0,
	0.5,
	4.0,
	0.0
]);
const AF = new Complex128Array( A.length );
const IPIV = new Int32Array( N );
const C = new Float64Array([ 2.0, 0.5, 3.0 ]);
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
let i;

for ( i = 0; i < A.length; i++ ) {
	AF.set( A.get( i ), i );
}

zhetrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0 );

const rcond = zla_hercond_c( 'upper', N, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, C, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
console.log( rcond ); // eslint-disable-line no-console
