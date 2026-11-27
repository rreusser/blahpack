import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dcabs1 from './../lib/base.js';

// Compute |Re(z)| + |Im(z)| for z = 3 + 4i:
const z = new Complex128( 3.0, 4.0 );
const result = dcabs1( z );
console.log( result ); // eslint-disable-line no-console
// => 7.0
