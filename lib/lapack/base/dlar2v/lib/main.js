// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlar2v from './dlar2v.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlar2v, 'ndarray', ndarray );


// EXPORTS //

export default dlar2v;
