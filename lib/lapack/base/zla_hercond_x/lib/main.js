
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_hercond_x from './zla_hercond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_hercond_x, 'ndarray', ndarray );


// EXPORTS //

export default zla_hercond_x;
