/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_heamv from './zla_heamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_heamv, 'ndarray', ndarray );


// EXPORTS //

export default zla_heamv;
