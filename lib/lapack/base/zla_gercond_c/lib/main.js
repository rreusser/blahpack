
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gercond_c from './zla_gercond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gercond_c, 'ndarray', ndarray );


// EXPORTS //

export default zla_gercond_c;
