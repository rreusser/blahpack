
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemlqt from './dgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default dgemlqt;
