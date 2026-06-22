/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_syamv from './zla_syamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_syamv, 'ndarray', ndarray );


// EXPORTS //

export default zla_syamv;
