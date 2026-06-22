
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlantp from './dlantp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlantp, 'ndarray', ndarray );


// EXPORTS //

export default dlantp;
