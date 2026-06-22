import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/base.js';
import dgbtrs from './../../dgbtrs/lib/base.js';
import dgbrfs from './../lib/base.js';

// 1x1 system: 3*x = 5
var ab = new Float64Array( [ 3.0 ] );

var afb = new Float64Array( [ 3.0 ] );

var ipiv = new Int32Array( 1 );
dgbtrf( 1, 1, 0, 0, afb, 1, 1, 0, ipiv, 1, 0 );

var b = new Float64Array( [ 5.0 ] );

var x = new Float64Array( 1 );
x[ 0 ] = b[ 0 ];
dgbtrs( 'no-transpose', 1, 0, 0, 1, afb, 1, 1, 0, ipiv, 1, 0, x, 1, 1, 0 );

var ferr = new Float64Array( 1 );
var berr = new Float64Array( 1 );
var work = new Float64Array( 3 );
var iwork = new Int32Array( 1 );

var info = dgbrfs( 'no-transpose', 1, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len

console.log( 'info: %d', info );
console.log( 'x: %d', x[ 0 ] );
console.log( 'ferr: %d', ferr[ 0 ] );
console.log( 'berr: %d', berr[ 0 ] );
