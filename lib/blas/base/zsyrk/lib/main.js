// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyrk from './zsyrk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyrk, 'ndarray', ndarray );


// EXPORTS //

export default zsyrk;
