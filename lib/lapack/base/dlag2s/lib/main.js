
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlag2s from './dlag2s.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlag2s, 'ndarray', ndarray );


// EXPORTS //

export default dlag2s;
