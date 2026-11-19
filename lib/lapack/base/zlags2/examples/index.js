
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlags2 from './../lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

const snuv = reinterpret( snu, 0 );
const snvv = reinterpret( snv, 0 );
const snqv = reinterpret( snq, 0 );

zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0, csu, snu, csv, snv, csq, snq ); // eslint-disable-line max-len
console.log( out ); // eslint-disable-line no-console
