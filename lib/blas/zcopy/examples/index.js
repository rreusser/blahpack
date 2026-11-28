import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../lib/index.js';

// Copy complex vector zx into zy:
const zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
const zy = new Complex128Array( 2 );

// Using the standard interface:
zcopy( 2, zx, 1, zy, 1 );
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
zcopy.strided( 2, zx, 1, 0, zy, 1, 0 );
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console
