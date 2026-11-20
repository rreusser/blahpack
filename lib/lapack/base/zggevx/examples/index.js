import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggevx from './../lib/index.js';

const ilo = new Int32Array( 1 );
const ihi = new Int32Array( 1 );
const abnrm = new Float64Array( 1 );
const bbnrm = new Float64Array( 1 );

const N = 2;

// Column-major diagonal pair: eigenvalues 2 and 2.
const A = new Complex128Array( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
const B = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
const ALPHA = new Complex128Array( N );
const BETA = new Complex128Array( N );
const VL = new Complex128Array( N * N );
const VR = new Complex128Array( N * N );
const LSCALE = new Float64Array( N );
const RSCALE = new Float64Array( N );
const RCONDE = new Float64Array( N );
const RCONDV = new Float64Array( N );

const r = {
	'info': zggevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, B, N, ALPHA, 1, BETA, 1, VL, N, VR, N, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1, null, null, null, null ),
	'ilo': ilo[ 0 ],
	'ihi': ihi[ 0 ],
	'abnrm': abnrm[ 0 ],
	'bbnrm': bbnrm[ 0 ]
};
console.log( r ); // eslint-disable-line no-console
