
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunm22 from './zunm22.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunm22, 'ndarray', ndarray );


// EXPORTS //

export default zunm22;
