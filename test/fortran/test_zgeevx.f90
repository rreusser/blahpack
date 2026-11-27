program test_zgeevx
  use test_utils
  implicit none

  integer, parameter :: NMAX = 4
  complex*16 :: A(NMAX,NMAX), W(NMAX), VL(NMAX,NMAX), VR(NMAX,NMAX)
  complex*16 :: WORK(400)
  double precision :: RWORK(400)
  double precision :: SCALE(NMAX), RCONDE(NMAX), RCONDV(NMAX)
  double precision :: ABNRM
  double precision :: A_r(2*NMAX*NMAX), W_r(2*NMAX), VL_r(2*NMAX*NMAX), VR_r(2*NMAX*NMAX)
  equivalence (A, A_r)
  equivalence (W, W_r)
  equivalence (VL, VL_r)
  equivalence (VR, VR_r)
  integer :: INFO, N, LWORK, ILO, IHI

  LWORK = 400

  ! Test 1: N=0 quick return
  N = 0
  INFO = -1
  call ZGEEVX('N', 'N', 'N', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n0')
  call print_int('info', INFO)
  call end_test()

  ! Test 2: N=1, balance='none' no vectors
  N = 1
  A(1,1) = dcmplx(3.0d0, 2.0d0)
  call ZGEEVX('N', 'N', 'N', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n1_none')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2)
  call print_array('scale', SCALE, 1)
  call end_test()

  ! Test 3: N=2, balance='both', right vectors
  N = 2
  A(1,1) = dcmplx(1.0d0, 0.0d0)
  A(1,2) = dcmplx(0.0d0, 0.0d0)
  A(2,1) = dcmplx(0.0d0, 0.0d0)
  A(2,2) = dcmplx(2.0d0, 0.0d0)
  call ZGEEVX('B', 'N', 'V', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n2_balanceB_vr')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('VR', VR_r, 2*N*N)
  call print_array('scale', SCALE, N)
  call end_test()

  ! Test 4: N=2 general, both eigenvectors, balance='none'
  N = 2
  A(1,1) = dcmplx(1.0d0, 2.0d0)
  A(1,2) = dcmplx(3.0d0, 0.0d0)
  A(2,1) = dcmplx(0.0d0, 1.0d0)
  A(2,2) = dcmplx(4.0d0, -1.0d0)
  call ZGEEVX('N', 'V', 'V', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n2_none_both')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('VL', VL_r, 2*N*N)
  call print_array('VR', VR_r, 2*N*N)
  call print_array('scale', SCALE, N)
  call end_test()

  ! Test 5: N=3 general, right eigenvectors, balance='scale'
  N = 3
  A(1,1) = dcmplx(1.0d0, 0.0d0)
  A(1,2) = dcmplx(2.0d0, 1.0d0)
  A(1,3) = dcmplx(0.0d0, 0.0d0)
  A(2,1) = dcmplx(0.0d0, -1.0d0)
  A(2,2) = dcmplx(3.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.5d0)
  A(3,1) = dcmplx(0.0d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 0.0d0)
  A(3,3) = dcmplx(5.0d0, -2.0d0)
  call ZGEEVX('S', 'N', 'V', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n3_scale_vr')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('VR', VR_r, 2*N*N)
  call print_array('scale', SCALE, N)
  call end_test()

  ! Test 6: N=4 diag dominant, balance='permute', both
  N = 4
  A(1,1) = dcmplx(10.0d0, 0.0d0)
  A(1,2) = dcmplx(1.0d0, 0.5d0)
  A(1,3) = dcmplx(0.0d0, 0.0d0)
  A(1,4) = dcmplx(0.0d0, 0.0d0)
  A(2,1) = dcmplx(0.5d0, -0.5d0)
  A(2,2) = dcmplx(20.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.0d0)
  A(2,4) = dcmplx(0.0d0, 0.0d0)
  A(3,1) = dcmplx(0.0d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 1.0d0)
  A(3,3) = dcmplx(30.0d0, 0.0d0)
  A(3,4) = dcmplx(0.5d0, 0.5d0)
  A(4,1) = dcmplx(0.0d0, 0.0d0)
  A(4,2) = dcmplx(0.0d0, 0.0d0)
  A(4,3) = dcmplx(0.5d0, -0.5d0)
  A(4,4) = dcmplx(40.0d0, 0.0d0)
  call ZGEEVX('P', 'V', 'V', 'N', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n4_permute_both')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('VL', VL_r, 2*N*N)
  call print_array('VR', VR_r, 2*N*N)
  call print_array('scale', SCALE, N)
  call end_test()

  ! Test 7: N=3, sense='E' (eigenvalues), both eigenvectors, balance='none'
  N = 3
  A(1,1) = dcmplx(1.0d0, 0.5d0)
  A(1,2) = dcmplx(2.0d0, 0.0d0)
  A(1,3) = dcmplx(0.5d0, -1.0d0)
  A(2,1) = dcmplx(0.0d0, 1.0d0)
  A(2,2) = dcmplx(3.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.0d0)
  A(3,1) = dcmplx(0.5d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 0.5d0)
  A(3,3) = dcmplx(5.0d0, -1.0d0)
  call ZGEEVX('N', 'V', 'V', 'E', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n3_sense_e')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('rconde', RCONDE, N)
  call end_test()

  ! Test 8: N=3, sense='V' (right-vectors), no vl, right vr, balance='none'
  N = 3
  A(1,1) = dcmplx(1.0d0, 0.5d0)
  A(1,2) = dcmplx(2.0d0, 0.0d0)
  A(1,3) = dcmplx(0.5d0, -1.0d0)
  A(2,1) = dcmplx(0.0d0, 1.0d0)
  A(2,2) = dcmplx(3.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.0d0)
  A(3,1) = dcmplx(0.5d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 0.5d0)
  A(3,3) = dcmplx(5.0d0, -1.0d0)
  call ZGEEVX('N', 'N', 'V', 'V', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n3_sense_v')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('rcondv', RCONDV, N)
  call end_test()

  ! Test 9b: N=3 upper triangular, sense='B' — Schur form is exact so
  ! the condition number computation is deterministic and comparable.
  N = 3
  A(1,1) = dcmplx(1.0d0, 0.0d0)
  A(1,2) = dcmplx(2.0d0, 0.0d0)
  A(1,3) = dcmplx(0.0d0, 1.0d0)
  A(2,1) = dcmplx(0.0d0, 0.0d0)
  A(2,2) = dcmplx(3.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.0d0)
  A(3,1) = dcmplx(0.0d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 0.0d0)
  A(3,3) = dcmplx(5.0d0, 0.0d0)
  call ZGEEVX('N', 'V', 'V', 'B', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n3_triu_sense_b')
  call print_int('info', INFO)
  call print_array('w', W_r, 2*N)
  call print_array('rconde', RCONDE, N)
  call print_array('rcondv', RCONDV, N)
  call end_test()

  ! Test 9: N=3, sense='B' (both), both eigenvectors, balance='both'
  N = 3
  A(1,1) = dcmplx(1.0d0, 0.5d0)
  A(1,2) = dcmplx(2.0d0, 0.0d0)
  A(1,3) = dcmplx(0.5d0, -1.0d0)
  A(2,1) = dcmplx(0.0d0, 1.0d0)
  A(2,2) = dcmplx(3.0d0, 0.0d0)
  A(2,3) = dcmplx(1.0d0, 0.0d0)
  A(3,1) = dcmplx(0.5d0, 0.0d0)
  A(3,2) = dcmplx(0.0d0, 0.5d0)
  A(3,3) = dcmplx(5.0d0, -1.0d0)
  call ZGEEVX('B', 'V', 'V', 'B', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n3_sense_b')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('rconde', RCONDE, N)
  call print_array('rcondv', RCONDV, N)
  call end_test()

  ! Test 10: N=1, sense='B' (both), both eigenvectors, no balancing (ticket 0110:
  ! the reference has no N=1 shortcut; RCONDV is |A(1,1)|, not 1)
  N = 1
  A(1,1) = dcmplx(3.0d0, 2.0d0)
  call ZGEEVX('N', 'V', 'V', 'B', N, A, NMAX, W, VL, NMAX, VR, NMAX, &
              ILO, IHI, SCALE, ABNRM, RCONDE, RCONDV, WORK, LWORK, RWORK, INFO)
  call begin_test('n1_sense_b')
  call print_int('info', INFO)
  call print_int('ilo', ILO)
  call print_int('ihi', IHI)
  call print_scalar('abnrm', ABNRM)
  call print_array('w', W_r, 2*N)
  call print_array('rconde', RCONDE, N)
  call print_array('rcondv', RCONDV, N)
  call end_test()

end program
