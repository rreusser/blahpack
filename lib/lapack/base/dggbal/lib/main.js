
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggbal from './dggbal.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggbal, 'ndarray', ndarray );


// EXPORTS //

export default dggbal;
