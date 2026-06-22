
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatrs3 from './dlatrs3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlatrs3, 'ndarray', ndarray );


// EXPORTS //

export default dlatrs3;
