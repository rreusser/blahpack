import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgsy2 from './../lib/index.js';

// 2x2 upper triangular complex matrices (A,D) and (B,E):
const A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.5, 0.2, 2.0, -0.3 ] );
const B = new Complex128Array( [ 3.0, 0.1, 0.0, 0.0, 0.3, -0.1, 4.0, 0.2 ] );
const C = new Complex128Array( [ 1.0, 0.5, 3.0, 1.0, 2.0, -0.5, 4.0, 0.3 ] );
const D = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 0.1, 1.5, -0.1 ] );
const E = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.1, 0.05, 2.0, 0.1 ] );
const F = new Complex128Array( [ 5.0, 1.0, 7.0, 0.5, 6.0, -1.0, 8.0, 0.2 ] );
const scale = new Float64Array( 1 );
const rdsum = new Float64Array( [ 0.0 ] );
const rdscal = new Float64Array( [ 1.0 ] );

const info = ztgsy2.ndarray( 'no-transpose', 0, 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, D, 1, 2, 0, E, 1, 2, 0, F, 1, 2, 0, scale, rdsum, rdscal ); // eslint-disable-line max-len

const Cv = reinterpret( C, 0 );
const Fv = reinterpret( F, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'scale:', scale[ 0 ] ); // eslint-disable-line no-console
console.log( 'C (re/im):', Array.prototype.slice.call( Cv ) ); // eslint-disable-line no-console, max-len
console.log( 'F (re/im):', Array.prototype.slice.call( Fv ) ); // eslint-disable-line no-console, max-len
