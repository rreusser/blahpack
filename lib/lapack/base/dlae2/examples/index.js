/* eslint-disable no-console */

import dlae2 from './../lib/index.js';

// Identity matrix — both eigenvalues are 1.0:
var out = dlae2( 1.0, 0.0, 1.0 );
console.log( 'Identity: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Symmetric matrix with off-diagonal element:
out = dlae2( 2.0, 1.0, 2.0 );
console.log( 'Symmetric: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Negative trace (sm < 0):
out = dlae2( -3.0, 1.0, -5.0 );
console.log( 'Negative trace: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Zero trace (sm = 0, a = -c):
out = dlae2( 3.0, 2.0, -3.0 );
console.log( 'Zero trace: rt1=%d, rt2=%d', out.rt1, out.rt2 );
