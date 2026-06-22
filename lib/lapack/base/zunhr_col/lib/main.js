

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunhr_col from './zunhr_col.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunhr_col, 'ndarray', ndarray );


// EXPORTS //

export default zunhr_col;
