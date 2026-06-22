// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaed2 from './dlaed2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaed2, 'ndarray', ndarray );


// EXPORTS //

export default dlaed2;
