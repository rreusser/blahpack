// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrttf from './dtrttf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrttf, 'ndarray', ndarray );


// EXPORTS //

export default dtrttf;
