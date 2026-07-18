import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrd from './../lib/index.js';

const N = 4;
const d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
const e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
const E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
const GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
const ISPLIT = new Int32Array( [ N ] );
const w = new Float64Array( N );
const WERR = new Float64Array( N );
const IBLOCK = new Int32Array( N );
const INDEXW = new Int32Array( N );

const res = dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, w, 1, WERR, 1, IBLOCK, 1, INDEXW, 1 );

console.log( 'm = %d, info = %d', res.m, res.info ); // eslint-disable-line no-console
console.log( w ); // eslint-disable-line no-console
