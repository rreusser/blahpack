// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaqhe from './zlaqhe.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaqhe, 'ndarray', ndarray );


// EXPORTS //

export default zlaqhe;
