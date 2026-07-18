import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpotrf from './../../zpotrf/lib/base.js';
import zlaPorcondX from './../lib/index.js';

const N = 3;
const A = new Complex128Array([
	4,
	0,
	1,
	2,
	3,
	-1,
	1,
	-2,
	5,
	0,
	2,
	1,
	3,
	1,
	2,
	-1,
	6,
	0
]);
const AF = new Complex128Array( A );
const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

zpotrf( 'upper', N, AF, 1, N, 0 );

const rcond = zlaPorcondX( 'column-major', 'upper', N, A, N, AF, N, X, 1, WORK, 1, RWORK, 1 );
console.log( rcond ); // eslint-disable-line no-console
