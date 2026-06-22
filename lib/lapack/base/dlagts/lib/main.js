// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlagts from './dlagts.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlagts, 'ndarray', ndarray );


// EXPORTS //

export default dlagts;
