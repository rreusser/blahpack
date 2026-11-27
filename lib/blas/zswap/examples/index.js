import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zswap from './../lib/index.js';

// Swap complex vectors x and y:
let x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
let y = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );

// Using the standard interface:
zswap( 2, x, 1, y, 1 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console

// Using the ndarray interface:
x = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
y = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
zswap.ndarray( 2, x, 1, 0, y, 1, 0 );
console.log( x ); // eslint-disable-line no-console
console.log( y ); // eslint-disable-line no-console
