

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeql2 from './dgeql2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeql2, 'ndarray', ndarray );


// EXPORTS //

export default dgeql2;
