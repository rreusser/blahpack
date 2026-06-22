/* eslint-disable camelcase, max-len */

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_gbrfsx_extended from './../lib/index.js';

// 2x2 diagonal complex system (KL=KU=0) with an exact initial solution Y.
var N = 2;
var KL = 0;
var KU = 0;
var LDAB = 1;
var LDAFB = 1;

var AB = new Complex128Array( [ 2.0, 0.0, 3.0, 0.0 ] );
var AFB = new Complex128Array( [ 2.0, 0.0, 3.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var B = new Complex128Array( [ 2.0, 0.0, 3.0, 0.0 ] );
var Y = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var RES = new Complex128Array( N );
var DY = new Complex128Array( N );
var Y_TAIL = new Complex128Array( N );
var C = new Float64Array( [ 1.0, 1.0 ] );
var AYB = new Float64Array( N );
var BERR_OUT = new Float64Array( 1 );
var ERR_BNDS_NORM = new Float64Array( 3 );
var ERR_BNDS_COMP = new Float64Array( 3 );
ERR_BNDS_NORM[ 0 ] = 1.0;
ERR_BNDS_COMP[ 0 ] = 1.0;

zla_gbrfsx_extended( 'column-major', 1, 'no-transpose', N, KL, KU, 1, AB, LDAB, AFB, LDAFB, IPIV, 1, 0, false, C, 1, B, N, Y, N, BERR_OUT, 1, 2, ERR_BNDS_NORM, 1, ERR_BNDS_COMP, 1, RES, 1, AYB, 1, DY, 1, Y_TAIL, 1, 1.0, 10, 0.5, 0.25, false );

console.log( BERR_OUT ); // eslint-disable-line no-console
