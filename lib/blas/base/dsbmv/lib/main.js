
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbmv from './dsbmv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbmv, 'ndarray', ndarray );


// EXPORTS //

export default dsbmv;
