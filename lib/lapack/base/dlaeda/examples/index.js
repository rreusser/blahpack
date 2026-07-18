import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import { ndarray as dlaeda } from './../lib/index.js';

// Single-level merge: two 2x2 orthogonal sub-blocks packed into Q.

// QPTR's 1-based offsets point at successive sub-blocks of Q.
const QPTR = new Int32Array( [ 1, 5, 9 ] );
const q = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );

const z = new Float64Array( 4 );
const ztemp = new Float64Array( 4 );

// Empty index arrays — the K loop doesn't execute for CURLVL=1.
const prmptr = new Int32Array( 4 );
const perm = new Int32Array( 4 );
const givptr = new Int32Array( 4 );
const givcol = new Int32Array( 2 * 4 );
const givnum = new Float64Array( 2 * 4 );

const info = dlaeda( 4, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );

console.log( 'INFO = %d', info );
console.log( 'Z = %s', z.toString() );
