process.env.ZLABRD_DEBUG = '1';

import zlabrd from './../lib/base.js';

var M = 2;
var N = 4;
var nb = 2;
var LDA = M;
var LDX = M;
var LDY = N;

var A = new Float64Array([
	1.5, 0.5, -0.8, 0.3,
	0.6, -0.2, 1.0, 0.7,
	-0.4, 0.9, 0.2, -0.6,
	0.7, -0.1, -0.3, 0.4
]);
var d = new Float64Array( nb );
var e = new Float64Array( nb );
var TAUQ = new Float64Array( 2 * nb );
var TAUP = new Float64Array( 2 * nb );
var X = new Float64Array( 2 * LDX * nb );
var Y = new Float64Array( 2 * LDY * nb );

zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

console.log( 'Final A:', Array.from( A ) );
console.log( 'Expected A[6]:', -0.41386 );
console.log( 'Actual A[6]:', A[ 6 ] );
