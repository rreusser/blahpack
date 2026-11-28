

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ilaenv from './ilaenv.js';
import strided from './strided.js';


// MAIN //

setReadOnly( ilaenv, 'strided', strided );


// EXPORTS //

export default /** @type {typeof ilaenv & { strided: typeof strided }} */ ( ilaenv );
export { strided };
