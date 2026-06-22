
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlantp from './zlantp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlantp, 'ndarray', ndarray );


// EXPORTS //

export default zlantp;
