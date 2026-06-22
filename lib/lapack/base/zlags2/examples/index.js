
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlags2 from './../lib/index.js';

var out = zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0 ); // eslint-disable-line max-len
console.log( out ); // eslint-disable-line no-console
