// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgebal from './dgebal.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgebal, 'ndarray', ndarray );


// EXPORTS //

export default dgebal;
