import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqgb from './../lib/index.js';

// 2x2 band matrix with kl=1, ku=0, ldab=2:
var AB = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0, 4.0, 2.0 ] );
var r = new Float64Array( [ 0.5, 2.0 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );
var ABv;
var equed;

equed = zlaqgb.ndarray( 2, 2, 1, 0, AB, 1, 2, 0, r, 1, 0, c, 1, 0, 0.01, 1.0, 5.0 ); // eslint-disable-line max-len
console.log( 'equed:', equed ); // eslint-disable-line no-console
// => equed: row

ABv = reinterpret( AB, 0 );
console.log( 'AB (scaled):', ABv ); // eslint-disable-line no-console
