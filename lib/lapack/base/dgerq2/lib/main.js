// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgerq2 from './dgerq2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgerq2, 'ndarray', ndarray );


// EXPORTS //

export default dgerq2;
