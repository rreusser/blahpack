/* eslint-disable no-console */

import dlae2 from './../lib/index.js';


dlae2( 1.0, 0.0, 1.0, rt1, rt2 );
console.log( 'Identity: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Symmetric matrix with off-diagonal element:
dlae2( 2.0, 1.0, 2.0, rt1, rt2 );
console.log( 'Symmetric: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Negative trace (sm < 0):
dlae2( -3.0, 1.0, -5.0, rt1, rt2 );
console.log( 'Negative trace: rt1=%d, rt2=%d', out.rt1, out.rt2 );

// Zero trace (sm = 0, a = -c):
dlae2( 3.0, 2.0, -3.0, rt1, rt2 );
console.log( 'Zero trace: rt1=%d, rt2=%d', out.rt1, out.rt2 );
