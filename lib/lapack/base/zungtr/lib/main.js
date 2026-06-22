// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungtr from './zungtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungtr, 'ndarray', ndarray );


// EXPORTS //

export default zungtr;
