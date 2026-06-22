
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dhgeqz from './dhgeqz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dhgeqz, 'ndarray', ndarray );


// EXPORTS //

export default dhgeqz;
