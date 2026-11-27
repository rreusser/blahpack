import dlaev2 from './../lib/base.js';

// Compute the eigendecomposition of a 2-by-2 symmetric matrix:

//   [ 2.0  1.0 ]

//   [ 1.0  3.0 ]
const rt1 = new Float64Array( 1 );
const rt2 = new Float64Array( 1 );
const cs1 = new Float64Array( 1 );
const sn1 = new Float64Array( 1 );

dlaev2( 2.0, 1.0, 3.0, rt1, rt2, cs1, sn1 );

console.log( 'Eigenvalue of larger absolute value (rt1):', rt1[ 0 ] ); // eslint-disable-line no-console
console.log( 'Eigenvalue of smaller absolute value (rt2):', rt2[ 0 ] ); // eslint-disable-line no-console
console.log( 'Cosine of rotation (cs1):', cs1[ 0 ] ); // eslint-disable-line no-console
console.log( 'Sine of rotation (sn1):', sn1[ 0 ] ); // eslint-disable-line no-console
