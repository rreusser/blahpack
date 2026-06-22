
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlanhs from './dlanhs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlanhs, 'ndarray', ndarray );


// EXPORTS //

export default dlanhs;
