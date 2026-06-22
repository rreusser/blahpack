

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorgr2 from './dorgr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorgr2, 'ndarray', ndarray );


// EXPORTS //

export default dorgr2;
