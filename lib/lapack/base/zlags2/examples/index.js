
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlags2 from './../lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

const csu = new Float64Array( 1 );
const snu = new Complex128Array( 1 );
const snuv = reinterpret( snu, 0 );
const csv = new Float64Array( 1 );
const snv = new Complex128Array( 1 );
const snvv = reinterpret( snv, 0 );
const csq = new Float64Array( 1 );
const snq = new Complex128Array( 1 );
const snqv = reinterpret( snq, 0 );

zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0, csu, snu, csv, snv, csq, snq );
const out = {
	'csu': csu[ 0 ],
	'snuR': snuv[ 0 ],
	'snuI': snuv[ 1 ],
	'csv': csv[ 0 ],
	'snvR': snvv[ 0 ],
	'snvI': snvv[ 1 ],
	'csq': csq[ 0 ],
	'snqR': snqv[ 0 ],
	'snqI': snqv[ 1 ]
}; // eslint-disable-line max-len
console.log( out ); // eslint-disable-line no-console
