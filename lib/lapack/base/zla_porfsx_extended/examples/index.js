/* eslint-disable camelcase */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { ndarray as zla_porfsx_extended } from './../lib/index.js';
import zpotrf from './../../zpotrf/lib/base.js';
import zpotrs from './../../zpotrs/lib/base.js';

// 3x3 Hermitian positive-definite matrix (column-major).
const A = new Complex128Array([
	4.0,
	0.0,
	1.0,
	-1.0,
	0.0,
	0.0,
	1.0,
	1.0,
	3.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	2.0,
	0.0
]);
const B = new Complex128Array([ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ]);
const AF = new Complex128Array( A.length );
const Y = new Complex128Array( B.length );
const c = new Float64Array([ 1.0, 1.0, 1.0 ]);
const RES = new Complex128Array( 3 );
const DY = new Complex128Array( 3 );
const YT = new Complex128Array( 3 );
const AYB = new Float64Array( 3 );
const berr_out = new Float64Array( 1 );
const err_bnds_norm = new Float64Array( 3 );
const err_bnds_comp = new Float64Array( 3 );

AF.set( A );
zpotrf( 'upper', 3, AF, 1, 3, 0 );

Y.set( B );
zpotrs( 'upper', 3, 1, AF, 1, 3, 0, Y, 1, 3, 0 );

const info = zla_porfsx_extended(1, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, c, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, err_bnds_norm, 1, 1, 0, err_bnds_comp, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false);
console.log( 'info = %d', info ); // eslint-disable-line no-console
console.log( 'berr_out = %s', berr_out ); // eslint-disable-line no-console
