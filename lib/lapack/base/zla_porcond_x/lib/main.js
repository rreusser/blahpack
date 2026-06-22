/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porcond_x from './zla_porcond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_porcond_x, 'ndarray', ndarray );


// EXPORTS //

export default zla_porcond_x;
