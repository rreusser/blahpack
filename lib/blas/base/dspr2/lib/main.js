
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspr2 from './dspr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspr2, 'ndarray', ndarray );


// EXPORTS //

export default dspr2;
