import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdscal from './../lib/index.js';

// Scale a complex vector by a real constant:
const zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );

// Using the standard interface:
zdscal( 2, 2.0, zx, 1 );
console.log( reinterpret( zx, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
zdscal.strided( 2, 2.0, zx, 1, 0 );
console.log( reinterpret( zx, 0 ) ); // eslint-disable-line no-console
