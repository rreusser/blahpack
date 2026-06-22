/* eslint-disable camelcase, stdlib/require-file-extensions */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbamv from '@stdlib/lapack/base/dla_gbamv';

var N = 4;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;

var AB = new Float64Array( LDAB * N );
var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
var y = new Float64Array( N );

AB[ 1 ] = 1.0;
AB[ 2 ] = 3.0;
AB[ 3 ] = -2.0;
AB[ 4 ] = 4.0;
AB[ 5 ] = -6.0;
AB[ 6 ] = -5.0;
AB[ 7 ] = 7.0;
AB[ 8 ] = -9.0;
AB[ 9 ] = 8.0;
AB[ 10 ] = 10.0;

dla_gbamv( 'column-major', 'no-transpose', N, N, KL, KU, 1.0, AB, LDAB, x, 1, 0.0, y, 1 );
console.log( y ); // eslint-disable-line no-console
