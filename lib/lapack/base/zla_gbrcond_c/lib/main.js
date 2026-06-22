
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrcond_c from './zla_gbrcond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrcond_c, 'ndarray', ndarray );


// EXPORTS //

export default zla_gbrcond_c;
