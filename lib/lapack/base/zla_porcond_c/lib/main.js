
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porcond_c from './zla_porcond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_porcond_c, 'ndarray', ndarray );


// EXPORTS //

export default zla_porcond_c;
