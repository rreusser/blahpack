
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gerfsx_extended from './zla_gerfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gerfsx_extended, 'ndarray', ndarray );


// EXPORTS //

export default zla_gerfsx_extended;
