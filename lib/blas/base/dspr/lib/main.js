
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dspr from './dspr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dspr, 'ndarray', ndarray );


// EXPORTS //

export default dspr;
