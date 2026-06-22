
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porfsx_extended from './zla_porfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_porfsx_extended, 'ndarray', ndarray );


// EXPORTS //

export default zla_porfsx_extended;
