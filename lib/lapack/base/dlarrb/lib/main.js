
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrb from './dlarrb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrb, 'ndarray', ndarray );


// EXPORTS //

export default dlarrb;
