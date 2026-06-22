
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zheswapr from './zheswapr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zheswapr, 'ndarray', ndarray );


// EXPORTS //

export default zheswapr;
