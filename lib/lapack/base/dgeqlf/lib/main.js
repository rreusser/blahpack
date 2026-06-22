
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqlf from './dgeqlf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqlf, 'ndarray', ndarray );


// EXPORTS //

export default dgeqlf;
