// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaLinBerr from './zla_lin_berr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaLinBerr, 'ndarray', ndarray );


// EXPORTS //

export default zlaLinBerr;
