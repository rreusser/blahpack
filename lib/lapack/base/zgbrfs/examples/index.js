import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zgbtrs from './../../zgbtrs/lib/base.js';
import zgbrfs from './../lib/base.js';

// 1x1 system: (3+2i)*x = (5+i)
var ab = new Complex128Array( 1 );
var abv = reinterpret( ab, 0 );
abv[ 0 ] = 3.0;
abv[ 1 ] = 2.0;

var afb = new Complex128Array( 1 );
var afbv = reinterpret( afb, 0 );
afbv[ 0 ] = 3.0;
afbv[ 1 ] = 2.0;

var ipiv = new Int32Array( 1 );
zgbtrf( 1, 1, 0, 0, afb, 1, 1, 0, ipiv, 1, 0 );

var b = new Complex128Array( 1 );
var bv = reinterpret( b, 0 );
bv[ 0 ] = 5.0;
bv[ 1 ] = 1.0;

var x = new Complex128Array( 1 );
var xv = reinterpret( x, 0 );
xv[ 0 ] = bv[ 0 ];
xv[ 1 ] = bv[ 1 ];
zgbtrs( 'no-transpose', 1, 0, 0, 1, afb, 1, 1, 0, ipiv, 1, 0, x, 1, 1, 0 );

var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Complex128Array( 2 );
var rwork = new Float64Array( 1 );

var info = zgbrfs( 'no-transpose', 1, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len

console.log( 'info: %d', info );
console.log( 'x: %d + %di', xv[ 0 ], xv[ 1 ] );
console.log( 'ferr: %d', ferr[ 0 ] );
console.log( 'berr: %d', berr[ 0 ] );
