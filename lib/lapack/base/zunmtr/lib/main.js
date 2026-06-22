// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmtr from './zunmtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmtr, 'ndarray', ndarray );


// EXPORTS //

export default zunmtr;
