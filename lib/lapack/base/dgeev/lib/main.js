// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeev from './dgeev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeev, 'ndarray', ndarray );


// EXPORTS //

export default dgeev;
