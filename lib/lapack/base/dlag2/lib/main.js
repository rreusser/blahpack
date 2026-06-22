// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlag2 from './dlag2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlag2, 'ndarray', ndarray );


// EXPORTS //

export default dlag2;
