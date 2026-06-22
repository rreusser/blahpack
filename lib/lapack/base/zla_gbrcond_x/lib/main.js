
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrcond_x from './zla_gbrcond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrcond_x, 'ndarray', ndarray );


// EXPORTS //

export default zla_gbrcond_x;
