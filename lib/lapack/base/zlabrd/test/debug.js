import zlabrd from './../lib/base.js';

// nb1_3x3: M=3, N=3, nb=1
var M = 3;
var N = 3;
var nb = 1;
var LDA = M;
var LDX = M;
var LDY = N;

var A = new Float64Array([
	2.0, 1.0, -1.0, 0.5, 0.3, -0.2,
	0.5, -0.4, 1.0, 0.3, -0.7, 0.6,
	0.8, 0.2, -0.3, -0.1, 1.5, -0.5
]);
var d = new Float64Array( nb );
var e = new Float64Array( nb );
var TAUQ = new Float64Array( 2 * nb );
var TAUP = new Float64Array( 2 * nb );
var X = new Float64Array( 2 * LDX * nb );
var Y = new Float64Array( 2 * LDY * nb );

console.log('Before A:', Array.from(A));

zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

console.log('After A:', Array.from(A));
console.log('d:', Array.from(d));
console.log('e:', Array.from(e));
console.log('TAUQ:', Array.from(TAUQ));
console.log('TAUP:', Array.from(TAUP));
console.log('X:', Array.from(X));
console.log('Y:', Array.from(Y));

// Expected:
console.log('Expected A:', [1, 0, -0.18739, -0.15188, 0.05389, -0.05610, 1, -0, 1, 0.3, -0.7, 0.6, -0.51767, 0.27015, -0.3, -0.1, 1.5, -0.5]);
console.log('Expected d:', [-2.52587]);
console.log('Expected e:', [-1.33320]);
console.log('Expected TAUQ:', [1.79181, 0.39590]);
console.log('Expected TAUP:', [1.17224, -0.61173]);
console.log('Expected X:', [-0.62259, -1.81329, 0.97776, -0.23048, -1.41467, 1.50845]);
console.log('Expected Y:', [0, 0, 0.27038, 1.21556, 1.82935, -0.20000]);
