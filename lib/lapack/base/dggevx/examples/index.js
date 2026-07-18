
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggevx from './../lib/index.js';

const N = 2;
const A = new Float64Array( [ 2.0, 0.0, 0.0, 5.0 ] );
const B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const ALPHAR = new Float64Array( N );
const ALPHAI = new Float64Array( N );
const BETA = new Float64Array( N );
const VL = new Float64Array( 1 );
const VR = new Float64Array( 1 );
const LSCALE = new Float64Array( N );
const RSCALE = new Float64Array( N );
const RCONDE = new Float64Array( N );
const RCONDV = new Float64Array( N );

const out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', N, A, N, B, N, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( out ); // eslint-disable-line no-console
console.log( 'eigenvalue 0:', ALPHAR[ 0 ] / BETA[ 0 ] ); // eslint-disable-line no-console
console.log( 'eigenvalue 1:', ALPHAR[ 1 ] / BETA[ 1 ] ); // eslint-disable-line no-console
