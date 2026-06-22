
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsptri from './zsptri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsptri, 'ndarray', ndarray );


// EXPORTS //

export default zsptri;
