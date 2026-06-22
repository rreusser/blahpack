
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpteqr from './zpteqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpteqr, 'ndarray', ndarray );


// EXPORTS //

export default zpteqr;
