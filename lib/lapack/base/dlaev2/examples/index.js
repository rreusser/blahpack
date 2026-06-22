import dlaev2 from './../lib/base.js';

// Compute the eigendecomposition of a 2-by-2 symmetric matrix:

//   [ 2.0  1.0 ]

//   [ 1.0  3.0 ]
var result = dlaev2( 2.0, 1.0, 3.0 );

console.log( 'Eigenvalue of larger absolute value (rt1):', result.rt1 ); // eslint-disable-line no-console
console.log( 'Eigenvalue of smaller absolute value (rt2):', result.rt2 ); // eslint-disable-line no-console
console.log( 'Cosine of rotation (cs1):', result.cs1 ); // eslint-disable-line no-console
console.log( 'Sine of rotation (sn1):', result.sn1 ); // eslint-disable-line no-console
