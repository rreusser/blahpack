
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlat2s from './dlat2s.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlat2s, 'ndarray', ndarray );


// EXPORTS //

export default dlat2s;
