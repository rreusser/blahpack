
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlar1v from './dlar1v.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlar1v, 'ndarray', ndarray );


// EXPORTS //

export default dlar1v;
