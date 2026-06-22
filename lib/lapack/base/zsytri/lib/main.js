
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsytri from './zsytri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsytri, 'ndarray', ndarray );


// EXPORTS //

export default zsytri;
