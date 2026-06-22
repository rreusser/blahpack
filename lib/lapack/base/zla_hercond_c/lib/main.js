
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_hercond_c from './zla_hercond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_hercond_c, 'ndarray', ndarray );


// EXPORTS //

export default zla_hercond_c;
