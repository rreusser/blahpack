// esbuild entry point for the pseudospectra notebook.
// Bundles dgeev (eigenvalues) and dgesvd (SVD for sigma_min) into a browser-compatible ESM.

import dgeev from '../../lib/lapack/dgeev/lib/base.js';
import dgesvd from '../../lib/lapack/dgesvd/lib/base.js';
import dgemm from '../../lib/blas/dgemm/lib/base.js';

export { dgeev, dgesvd, dgemm };
