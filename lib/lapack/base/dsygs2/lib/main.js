// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsygs2 from './dsygs2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsygs2, 'ndarray', ndarray );


// EXPORTS //

export default dsygs2;
