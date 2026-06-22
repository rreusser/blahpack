/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gercond_x from './zla_gercond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gercond_x, 'ndarray', ndarray );


// EXPORTS //

export default zla_gercond_x;
