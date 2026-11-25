program test_dtrsyl
  use test_utils
  implicit none

  integer, parameter :: LDA = 4
  double precision :: A(LDA,LDA), B(LDA,LDA), C(LDA,LDA), SCALE
  double precision :: Cpacked(16)
  integer :: INFO, i, j, idx

  ! Test 1: NN, M=2, N=2, scalar blocks
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 2.0d0
  A(2,2) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 1.0d0
  B(2,2) = 4.0d0
  C(1,1) = 5.0d0; C(1,2) = 6.0d0
  C(2,1) = 7.0d0; C(2,2) = 8.0d0
  call DTRSYL('N', 'N', 1, 2, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN basic 2x2')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 2: NN with isgn=-1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 2.0d0
  A(2,2) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 1.0d0
  B(2,2) = 4.0d0
  C(1,1) = 5.0d0; C(1,2) = 6.0d0
  C(2,1) = 7.0d0; C(2,2) = 8.0d0
  call DTRSYL('N', 'N', -1, 2, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN isgn=-1')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 3: TN (transpose A)
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 2.0d0
  A(2,2) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 1.0d0
  B(2,2) = 4.0d0
  C(1,1) = 5.0d0; C(1,2) = 6.0d0
  C(2,1) = 7.0d0; C(2,2) = 8.0d0
  call DTRSYL('T', 'N', 1, 2, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN basic')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 4: TT (transpose both)
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 2.0d0
  A(2,2) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 1.0d0
  B(2,2) = 4.0d0
  C(1,1) = 5.0d0; C(1,2) = 6.0d0
  C(2,1) = 7.0d0; C(2,2) = 8.0d0
  call DTRSYL('T', 'T', 1, 2, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT basic')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 5: NT (transpose B)
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 2.0d0
  A(2,2) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 1.0d0
  B(2,2) = 4.0d0
  C(1,1) = 5.0d0; C(1,2) = 6.0d0
  C(2,1) = 7.0d0; C(2,2) = 8.0d0
  call DTRSYL('N', 'T', 1, 2, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT basic')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 6: M=0 quick return
  call DTRSYL('N', 'N', 1, 0, 2, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('M=0')
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 7: N=0 quick return
  call DTRSYL('N', 'N', 1, 2, 0, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('N=0')
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 8: 3x3 with 2x2 block (quasi-triangular A)
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,2) = 2.0d0; A(2,3) = 0.4d0
  A(3,2) = -0.5d0; A(3,3) = 2.0d0
  B(1,1) = 3.0d0; B(1,2) = 0.2d0; B(1,3) = 0.1d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0
  B(3,2) = -0.3d0; B(3,3) = 4.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0
  call DTRSYL('N', 'N', 1, 3, 3, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN 3x3 quasi-tri')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 9: M=1, N=1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 2.0d0
  B(1,1) = 3.0d0
  C(1,1) = 10.0d0
  call DTRSYL('N', 'N', 1, 1, 1, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('M=1 N=1')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 10: TN 3x3 quasi-triangular
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,2) = 2.0d0; A(2,3) = 0.4d0
  A(3,2) = -0.5d0; A(3,3) = 2.0d0
  B(1,1) = 3.0d0; B(1,2) = 0.2d0; B(1,3) = 0.1d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0
  B(3,2) = -0.3d0; B(3,3) = 4.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0
  call DTRSYL('T', 'N', 1, 3, 3, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN 3x3 quasi-tri')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 11: TT 3x3 quasi-triangular
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,2) = 2.0d0; A(2,3) = 0.4d0
  A(3,2) = -0.5d0; A(3,3) = 2.0d0
  B(1,1) = 3.0d0; B(1,2) = 0.2d0; B(1,3) = 0.1d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0
  B(3,2) = -0.3d0; B(3,3) = 4.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0
  call DTRSYL('T', 'T', 1, 3, 3, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT 3x3 quasi-tri')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 12: NT 3x3 quasi-triangular
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,2) = 2.0d0; A(2,3) = 0.4d0
  A(3,2) = -0.5d0; A(3,3) = 2.0d0
  B(1,1) = 3.0d0; B(1,2) = 0.2d0; B(1,3) = 0.1d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0
  B(3,2) = -0.3d0; B(3,3) = 4.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0
  call DTRSYL('N', 'T', 1, 3, 3, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT 3x3 quasi-tri')
  call print_array('C', C, 16)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! ======================================================================
  ! Tests 13-16: 4x4 with 2x2 blocks in BOTH A and B
  ! A has a 2x2 block at rows/cols 1-2: eigenvalues ~ 1 +/- 0.5i
  !   A = [ 1.0  0.5  0.3  0.1 ]
  !       [-0.5  1.0  0.2  0.05]
  !       [ 0    0    3.0  0.4 ]
  !       [ 0    0   -0.6  3.0 ]
  ! B has a 2x2 block at rows/cols 3-4: eigenvalues ~ 5 +/- 0.7i
  !   B = [ 2.0  0.1  0.2  0.05]
  !       [ 0    4.0  0.3  0.1 ]
  !       [ 0    0    5.0  0.7 ]
  !       [ 0    0   -0.7  5.0 ]
  ! C is 4x4 general. Print only the M*N=16 packed entries.
  ! ======================================================================

  ! Test 13: NN 4x4 quasi-tri both A and B
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('N', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN 4x4 quasi-tri both')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 14: TN 4x4 quasi-tri both A and B
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('T', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN 4x4 quasi-tri both')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 15: TT 4x4 quasi-tri both A and B
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('T', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT 4x4 quasi-tri both')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 16: NT 4x4 quasi-tri both A and B
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('N', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT 4x4 quasi-tri both')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 17: NN 4x4 quasi-tri both isgn=-1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('N', 'N', -1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN 4x4 quasi-tri both isgn=-1')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 18: TN 4x4 quasi-tri both isgn=-1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('T', 'N', -1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN 4x4 quasi-tri both isgn=-1')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 19: TT 4x4 quasi-tri both isgn=-1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('T', 'T', -1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT 4x4 quasi-tri both isgn=-1')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! Test 20: NT 4x4 quasi-tri both isgn=-1
  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0; A(1,4) = 0.1d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0; A(2,4) = 0.05d0
  A(3,3) = 3.0d0; A(3,4) = 0.4d0
  A(4,3) = -0.6d0; A(4,4) = 3.0d0
  B(1,1) = 2.0d0; B(1,2) = 0.1d0; B(1,3) = 0.2d0; B(1,4) = 0.05d0
  B(2,2) = 4.0d0; B(2,3) = 0.3d0; B(2,4) = 0.1d0
  B(3,3) = 5.0d0; B(3,4) = 0.7d0
  B(4,3) = -0.7d0; B(4,4) = 5.0d0
  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0; C(1,4) = 4.0d0
  C(2,1) = 5.0d0; C(2,2) = 6.0d0; C(2,3) = 7.0d0; C(2,4) = 8.0d0
  C(3,1) = 9.0d0; C(3,2) = 10.0d0; C(3,3) = 11.0d0; C(3,4) = 12.0d0
  C(4,1) = 13.0d0; C(4,2) = 14.0d0; C(4,3) = 15.0d0; C(4,4) = 16.0d0
  call DTRSYL('N', 'T', -1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT 4x4 quasi-tri both isgn=-1')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  ! ======================================================================
  ! Overflow scaling (scaloc < 1): AS (1x1, 2x2, 1x1 blocks) and B scaled
  ! by 1e-3, C by 1e300, so every block pairing rescales.
  ! Near-singular: AN, BN with eigenvalues summing to zero (info = 1). C = 0:
  ! a nonzero RHS is amplified by 1/smin, so roundoff differences in DDOT
  ! would dominate the solution; perturbation detection does not depend on C.
  ! Non-standard 2x2 blocks with real eigenvalues are accepted by DTRSYL.
  ! ======================================================================

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1d0*1.0d-3
  A(1,2) = 0.5d0*1.0d-3
  A(1,3) = 0.3d0*1.0d-3
  A(1,4) = 0.1d0*1.0d-3
  A(2,2) = 2d0*1.0d-3
  A(2,3) = 0.4d0*1.0d-3
  A(2,4) = 0.2d0*1.0d-3
  A(3,2) = -0.6d0*1.0d-3
  A(3,3) = 2d0*1.0d-3
  A(3,4) = 0.3d0*1.0d-3
  A(4,4) = 3d0*1.0d-3
  B(1,1) = 2d0*1.0d-3
  B(1,2) = 0.1d0*1.0d-3
  B(1,3) = 0.2d0*1.0d-3
  B(1,4) = 0.05d0*1.0d-3
  B(2,2) = 4d0*1.0d-3
  B(2,3) = 0.3d0*1.0d-3
  B(2,4) = 0.1d0*1.0d-3
  B(3,3) = 5d0*1.0d-3
  B(3,4) = 0.7d0*1.0d-3
  B(4,3) = -0.7d0*1.0d-3
  B(4,4) = 5d0*1.0d-3
  C(1,1) = 1d0*1.0d300
  C(1,2) = 2d0*1.0d300
  C(1,3) = 3d0*1.0d300
  C(1,4) = 4d0*1.0d300
  C(2,1) = 5d0*1.0d300
  C(2,2) = 6d0*1.0d300
  C(2,3) = 7d0*1.0d300
  C(2,4) = 8d0*1.0d300
  C(3,1) = 9d0*1.0d300
  C(3,2) = 10d0*1.0d300
  C(3,3) = 11d0*1.0d300
  C(3,4) = 12d0*1.0d300
  C(4,1) = 13d0*1.0d300
  C(4,2) = 14d0*1.0d300
  C(4,3) = 15d0*1.0d300
  C(4,4) = 16d0*1.0d300
  call DTRSYL('N', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN 4x4 scaled')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,2) = 1d0
  A(1,3) = 0.3d0
  A(1,4) = 0.1d0
  A(2,2) = 1d0
  A(2,3) = 1d0
  A(2,4) = 0.2d0
  A(3,2) = 1d0
  A(3,3) = 1d0
  A(3,4) = 0.4d0
  A(4,4) = 3d0
  B(1,1) = 1d0
  B(1,2) = 1d0
  B(1,3) = 0.2d0
  B(1,4) = 0.1d0
  B(2,1) = 1d0
  B(2,2) = 1d0
  B(2,3) = 0.3d0
  B(2,4) = 0.2d0
  B(3,3) = -2d0
  B(3,4) = 0.5d0
  B(4,4) = -3d0
  call DTRSYL('N', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NN 4x4 near-singular')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1d0*1.0d-3
  A(1,2) = 0.5d0*1.0d-3
  A(1,3) = 0.3d0*1.0d-3
  A(1,4) = 0.1d0*1.0d-3
  A(2,2) = 2d0*1.0d-3
  A(2,3) = 0.4d0*1.0d-3
  A(2,4) = 0.2d0*1.0d-3
  A(3,2) = -0.6d0*1.0d-3
  A(3,3) = 2d0*1.0d-3
  A(3,4) = 0.3d0*1.0d-3
  A(4,4) = 3d0*1.0d-3
  B(1,1) = 2d0*1.0d-3
  B(1,2) = 0.1d0*1.0d-3
  B(1,3) = 0.2d0*1.0d-3
  B(1,4) = 0.05d0*1.0d-3
  B(2,2) = 4d0*1.0d-3
  B(2,3) = 0.3d0*1.0d-3
  B(2,4) = 0.1d0*1.0d-3
  B(3,3) = 5d0*1.0d-3
  B(3,4) = 0.7d0*1.0d-3
  B(4,3) = -0.7d0*1.0d-3
  B(4,4) = 5d0*1.0d-3
  C(1,1) = 1d0*1.0d300
  C(1,2) = 2d0*1.0d300
  C(1,3) = 3d0*1.0d300
  C(1,4) = 4d0*1.0d300
  C(2,1) = 5d0*1.0d300
  C(2,2) = 6d0*1.0d300
  C(2,3) = 7d0*1.0d300
  C(2,4) = 8d0*1.0d300
  C(3,1) = 9d0*1.0d300
  C(3,2) = 10d0*1.0d300
  C(3,3) = 11d0*1.0d300
  C(3,4) = 12d0*1.0d300
  C(4,1) = 13d0*1.0d300
  C(4,2) = 14d0*1.0d300
  C(4,3) = 15d0*1.0d300
  C(4,4) = 16d0*1.0d300
  call DTRSYL('T', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN 4x4 scaled')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,2) = 1d0
  A(1,3) = 0.3d0
  A(1,4) = 0.1d0
  A(2,2) = 1d0
  A(2,3) = 1d0
  A(2,4) = 0.2d0
  A(3,2) = 1d0
  A(3,3) = 1d0
  A(3,4) = 0.4d0
  A(4,4) = 3d0
  B(1,1) = 1d0
  B(1,2) = 1d0
  B(1,3) = 0.2d0
  B(1,4) = 0.1d0
  B(2,1) = 1d0
  B(2,2) = 1d0
  B(2,3) = 0.3d0
  B(2,4) = 0.2d0
  B(3,3) = -2d0
  B(3,4) = 0.5d0
  B(4,4) = -3d0
  call DTRSYL('T', 'N', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TN 4x4 near-singular')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1d0*1.0d-3
  A(1,2) = 0.5d0*1.0d-3
  A(1,3) = 0.3d0*1.0d-3
  A(1,4) = 0.1d0*1.0d-3
  A(2,2) = 2d0*1.0d-3
  A(2,3) = 0.4d0*1.0d-3
  A(2,4) = 0.2d0*1.0d-3
  A(3,2) = -0.6d0*1.0d-3
  A(3,3) = 2d0*1.0d-3
  A(3,4) = 0.3d0*1.0d-3
  A(4,4) = 3d0*1.0d-3
  B(1,1) = 2d0*1.0d-3
  B(1,2) = 0.1d0*1.0d-3
  B(1,3) = 0.2d0*1.0d-3
  B(1,4) = 0.05d0*1.0d-3
  B(2,2) = 4d0*1.0d-3
  B(2,3) = 0.3d0*1.0d-3
  B(2,4) = 0.1d0*1.0d-3
  B(3,3) = 5d0*1.0d-3
  B(3,4) = 0.7d0*1.0d-3
  B(4,3) = -0.7d0*1.0d-3
  B(4,4) = 5d0*1.0d-3
  C(1,1) = 1d0*1.0d300
  C(1,2) = 2d0*1.0d300
  C(1,3) = 3d0*1.0d300
  C(1,4) = 4d0*1.0d300
  C(2,1) = 5d0*1.0d300
  C(2,2) = 6d0*1.0d300
  C(2,3) = 7d0*1.0d300
  C(2,4) = 8d0*1.0d300
  C(3,1) = 9d0*1.0d300
  C(3,2) = 10d0*1.0d300
  C(3,3) = 11d0*1.0d300
  C(3,4) = 12d0*1.0d300
  C(4,1) = 13d0*1.0d300
  C(4,2) = 14d0*1.0d300
  C(4,3) = 15d0*1.0d300
  C(4,4) = 16d0*1.0d300
  call DTRSYL('T', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT 4x4 scaled')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,2) = 1d0
  A(1,3) = 0.3d0
  A(1,4) = 0.1d0
  A(2,2) = 1d0
  A(2,3) = 1d0
  A(2,4) = 0.2d0
  A(3,2) = 1d0
  A(3,3) = 1d0
  A(3,4) = 0.4d0
  A(4,4) = 3d0
  B(1,1) = 1d0
  B(1,2) = 1d0
  B(1,3) = 0.2d0
  B(1,4) = 0.1d0
  B(2,1) = 1d0
  B(2,2) = 1d0
  B(2,3) = 0.3d0
  B(2,4) = 0.2d0
  B(3,3) = -2d0
  B(3,4) = 0.5d0
  B(4,4) = -3d0
  call DTRSYL('T', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('TT 4x4 near-singular')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,1) = 1d0*1.0d-3
  A(1,2) = 0.5d0*1.0d-3
  A(1,3) = 0.3d0*1.0d-3
  A(1,4) = 0.1d0*1.0d-3
  A(2,2) = 2d0*1.0d-3
  A(2,3) = 0.4d0*1.0d-3
  A(2,4) = 0.2d0*1.0d-3
  A(3,2) = -0.6d0*1.0d-3
  A(3,3) = 2d0*1.0d-3
  A(3,4) = 0.3d0*1.0d-3
  A(4,4) = 3d0*1.0d-3
  B(1,1) = 2d0*1.0d-3
  B(1,2) = 0.1d0*1.0d-3
  B(1,3) = 0.2d0*1.0d-3
  B(1,4) = 0.05d0*1.0d-3
  B(2,2) = 4d0*1.0d-3
  B(2,3) = 0.3d0*1.0d-3
  B(2,4) = 0.1d0*1.0d-3
  B(3,3) = 5d0*1.0d-3
  B(3,4) = 0.7d0*1.0d-3
  B(4,3) = -0.7d0*1.0d-3
  B(4,4) = 5d0*1.0d-3
  C(1,1) = 1d0*1.0d300
  C(1,2) = 2d0*1.0d300
  C(1,3) = 3d0*1.0d300
  C(1,4) = 4d0*1.0d300
  C(2,1) = 5d0*1.0d300
  C(2,2) = 6d0*1.0d300
  C(2,3) = 7d0*1.0d300
  C(2,4) = 8d0*1.0d300
  C(3,1) = 9d0*1.0d300
  C(3,2) = 10d0*1.0d300
  C(3,3) = 11d0*1.0d300
  C(3,4) = 12d0*1.0d300
  C(4,1) = 13d0*1.0d300
  C(4,2) = 14d0*1.0d300
  C(4,3) = 15d0*1.0d300
  C(4,4) = 16d0*1.0d300
  call DTRSYL('N', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT 4x4 scaled')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

  A = 0.0d0; B = 0.0d0; C = 0.0d0
  A(1,2) = 1d0
  A(1,3) = 0.3d0
  A(1,4) = 0.1d0
  A(2,2) = 1d0
  A(2,3) = 1d0
  A(2,4) = 0.2d0
  A(3,2) = 1d0
  A(3,3) = 1d0
  A(3,4) = 0.4d0
  A(4,4) = 3d0
  B(1,1) = 1d0
  B(1,2) = 1d0
  B(1,3) = 0.2d0
  B(1,4) = 0.1d0
  B(2,1) = 1d0
  B(2,2) = 1d0
  B(2,3) = 0.3d0
  B(2,4) = 0.2d0
  B(3,3) = -2d0
  B(3,4) = 0.5d0
  B(4,4) = -3d0
  call DTRSYL('N', 'T', 1, 4, 4, A, 4, B, 4, C, 4, SCALE, INFO)
  call begin_test('NT 4x4 near-singular')
  call print_matrix('C', C, LDA, 4, 4)
  call print_scalar('scale', SCALE)
  call print_int('info', INFO)
  call end_test()

end program
