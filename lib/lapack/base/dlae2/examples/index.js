/* eslint-disable no-console */

import dlae2 from './../lib/index.js';

// Identity matrix — both eigenvalues are 1.0:
const rt1 = new Float64Array( 1 );
const rt2 = new Float64Array( 1 );

dlae2( 1.0, 0.0, 1.0, rt1, rt2 );
console.log( 'Identity: rt1=%d, rt2=%d', rt1[ 0 ], rt2[ 0 ] );

// Symmetric matrix with off-diagonal element:
dlae2( 2.0, 1.0, 2.0, rt1, rt2 );
console.log( 'Symmetric: rt1=%d, rt2=%d', rt1[ 0 ], rt2[ 0 ] );

// Negative trace (sm < 0):
dlae2( -3.0, 1.0, -5.0, rt1, rt2 );
console.log( 'Negative trace: rt1=%d, rt2=%d', rt1[ 0 ], rt2[ 0 ] );

// Zero trace (sm = 0, a = -c):
dlae2( 3.0, 2.0, -3.0, rt1, rt2 );
console.log( 'Zero trace: rt1=%d, rt2=%d', rt1[ 0 ], rt2[ 0 ] );
