// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgebak from './dgebak.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgebak, 'ndarray', ndarray );


// EXPORTS //

export default dgebak;
