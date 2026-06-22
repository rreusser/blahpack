/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrfsx_extended from './zla_gbrfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrfsx_extended, 'ndarray', ndarray );


// EXPORTS //

export default zla_gbrfsx_extended;
