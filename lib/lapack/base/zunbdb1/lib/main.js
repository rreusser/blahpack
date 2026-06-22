
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunbdb1 from './zunbdb1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunbdb1, 'ndarray', ndarray );


// EXPORTS //

export default zunbdb1;
