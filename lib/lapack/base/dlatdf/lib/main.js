// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatdf from './dlatdf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlatdf, 'ndarray', ndarray );


// EXPORTS //

export default dlatdf;
