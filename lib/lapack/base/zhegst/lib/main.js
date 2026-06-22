// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhegst from './zhegst.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhegst, 'ndarray', ndarray );


// EXPORTS //

export default zhegst;
