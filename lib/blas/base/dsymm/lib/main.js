
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsymm from './dsymm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsymm, 'ndarray', ndarray );


// EXPORTS //

export default dsymm;
