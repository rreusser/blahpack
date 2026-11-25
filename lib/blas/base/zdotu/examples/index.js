import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zdotu from './../lib/index.js';

// Compute unconjugated dot product of complex vectors:
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const y = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );

// Using the standard interface:
let result = zdotu( 2, x, 1, y, 1 );
console.log( result ); // eslint-disable-line no-console

// Using the ndarray interface:
result = zdotu.ndarray( 2, x, 1, 0, y, 1, 0 );
console.log( result ); // eslint-disable-line no-console
