
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggev from './dggev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggev, 'ndarray', ndarray );


// EXPORTS //

export default dggev;
