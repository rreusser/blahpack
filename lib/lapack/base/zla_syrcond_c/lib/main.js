
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_syrcond_c from './zla_syrcond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_syrcond_c, 'ndarray', ndarray );


// EXPORTS //

export default zla_syrcond_c;
