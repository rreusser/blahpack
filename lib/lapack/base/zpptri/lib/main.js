
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zpptri from './zpptri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zpptri, 'ndarray', ndarray );


// EXPORTS //

export default zpptri;
