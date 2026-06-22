import zgemv from '../../../../blas/base/zgemv/lib/base.js';

var ONE = new Float64Array( [ 1.0, 0.0 ] );
var NEGONE = new Float64Array( [ -1.0, 0.0 ] );

// Replicate the exact call from zlabrd debug
// Y matrix array (already scaled by TAUQ)
var Y = new Float64Array([
	0, 0,
	0.2703758010851802, 1.215561809938843,
	1.8293498572043647, -0.20000000000000007
]);

// A array (after conjugation of rows)
var A = new Float64Array([
	1, -0,              // A(0,0) conjugated
	-0.18739371113967984, 0.151881138897275,
	0.05389074200880654, -0.0560977128927152,
	0.5, 0.4,           // A(0,1) conjugated (was 0.5,-0.4)
	1, 0.3,
	-0.7, 0.6,
	0.8, -0.2,          // A(0,2) conjugated (was 0.8,0.2)
	-0.3, -0.1,
	1.5, -0.5
]);

console.log('Before zgemv, A[6..13]:', A[6], A[7], A[12], A[13]);

// zgemv('N', 2, 1, NEGONE, Y, 1, 3, 2, A, 3, 0, ONE, A, 3, 6)
zgemv('No transpose', 2, 1, NEGONE,
	Y, 1, 3, 2,
	A, 3, 0,
	ONE, A, 3, 6
);

console.log('After zgemv, A[6..13]:', A[6], A[7], A[12], A[13]);
console.log('Expected:');
console.log('  A[6] ~ 0.5 - 0.2704 = 0.2296');
console.log('  A[7] ~ 0.4 - 1.2156 = -0.8156');
console.log('  A[12] ~ 0.8 - 1.8293 = -1.0293');
console.log('  A[13] ~ -0.2 + 0.2 = 0.0');
