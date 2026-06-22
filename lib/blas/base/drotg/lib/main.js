
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import drotg from './drotg.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( drotg, 'ndarray', ndarray );


// EXPORTS //

export default drotg;
