/* eslint-disable camelcase, stdlib/require-globals */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/base.js';
import dla_porcond from './../lib/index.js';

// 3x3 SPD matrix (column-major):
var A = new Float64Array([
	4.0,
	1.0,
	0.5,
	1.0,
	5.0,
	1.0,
	0.5,
	1.0,
	6.0
]);
var AF = new Float64Array( A );
var C = new Float64Array([ 2.0, 1.0, 0.5 ]);
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );
var result;

// Factor with dpotrf:
dpotrf( 'upper', 3, AF, 1, 3, 0 );

// Estimate the Skeel condition number:
result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'Condition number estimate:', result ); // eslint-disable-line no-console
