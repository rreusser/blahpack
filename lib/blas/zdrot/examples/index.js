import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdrot from './../lib/index.js';

// Apply a real Givens rotation to complex vectors:
const zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
const zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );

// Using the standard interface:
zdrot( 2, zx, 1, zy, 1, 0.8, 0.6 );
console.log( reinterpret( zx, 0 ) ); // eslint-disable-line no-console
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
zdrot.ndarray( 2, zx, 1, 0, zy, 1, 0, 0.8, 0.6 );
console.log( reinterpret( zx, 0 ) ); // eslint-disable-line no-console
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console
