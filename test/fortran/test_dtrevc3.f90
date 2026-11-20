program test_dtrevc3
  use test_utils
  implicit none

  integer, parameter :: MAXN = 6
  double precision :: T(MAXN, MAXN), VL(MAXN, MAXN), VR(MAXN, MAXN)
  double precision :: WORK(3*MAXN)
  logical :: SELEC(MAXN)
  integer :: INFO, M, N, I
  integer :: ISEL(MAXN)

  ! ============================================================
  ! Test 1: SIDE='R', HOWMNY='A', 4x4 with 2 real + 1 complex pair
  ! ============================================================
  N = 4
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  call DTREVC3('R', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('right all 4x4')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 2: SIDE='L', HOWMNY='A', same matrix
  ! ============================================================
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  call DTREVC3('L', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('left all 4x4')
  call print_matrix('VL', VL, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 3: SIDE='B', HOWMNY='A', same matrix
  ! ============================================================
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  call DTREVC3('B', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('both all 4x4')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_matrix('VL', VL, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 4: SIDE='R', HOWMNY='S', select only eigenvalue 1 and complex pair
  ! ============================================================
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  SELEC(1) = .TRUE.
  SELEC(2) = .FALSE.
  SELEC(3) = .TRUE.
  SELEC(4) = .TRUE.
  call DTREVC3('R', 'S', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('right selected 4x4')
  call print_matrix('VR', VR, MAXN, N, M)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 4b: SIDE='R', HOWMNY='S', only the SECOND column of the complex
  ! pair (3,4) selected: M counts the pair, SELECT is standardized.
  ! ============================================================
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  SELEC(1) = .TRUE.
  SELEC(2) = .FALSE.
  SELEC(3) = .FALSE.
  SELEC(4) = .TRUE.
  call DTREVC3('R', 'S', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  do I = 1, N
    ISEL(I) = 0
    if ( SELEC(I) ) ISEL(I) = 1
  end do
  call begin_test('right selected second of pair 4x4')
  call print_matrix('VR', VR, MAXN, N, M)
  call print_int_array('SELECT', ISEL, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 5: SIDE='R', HOWMNY='B' (backtransform), 4x4 with identity as Q
  ! ============================================================
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  do I = 1, N
    VR(I, I) = 1.0d0
  end do
  call DTREVC3('R', 'B', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('right backtransform 4x4')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 6: All real eigenvalues (purely upper triangular, no 2x2 blocks)
  ! ============================================================
  N = 4
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 5.0d0; T(1,2) = 1.0d0; T(1,3) = 0.5d0; T(1,4) = 0.2d0
  T(2,2) = 3.0d0; T(2,3) = 0.8d0; T(2,4) = 0.3d0
  T(3,3) = 1.0d0; T(3,4) = 0.6d0
  T(4,4) = -1.0d0
  call DTREVC3('R', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('right all real 4x4')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 7: N=1 trivial
  ! ============================================================
  N = 1
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 7.0d0
  call DTREVC3('R', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, 1, M, WORK, 3, INFO)
  call begin_test('right N=1')
  call print_matrix('VR', VR, MAXN, 1, 1)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 8: Left eigenvectors, selected (HOWMNY='S', SIDE='L')
  ! Select only the complex pair (3,4) for left eigenvectors
  ! ============================================================
  N = 4
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  SELEC = .FALSE.
  SELEC(3) = .TRUE.
  SELEC(4) = .TRUE.
  call DTREVC3('L', 'S', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('left selected complex 4x4')
  call print_matrix('VL', VL, MAXN, N, M)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 9: Left backtransform (HOWMNY='B', SIDE='L')
  ! ============================================================
  N = 4
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  T(1,1) = 1.0d0; T(1,2) = 0.5d0; T(1,3) = 0.2d0; T(1,4) = 0.1d0
  T(2,2) = 2.0d0; T(2,3) = 0.3d0; T(2,4) = 0.15d0
  T(3,3) = 3.0d0; T(3,4) = -0.5d0
  T(4,3) = 0.8d0; T(4,4) = 3.0d0
  do I = 1, N
    VL(I, I) = 1.0d0
  end do
  call DTREVC3('L', 'B', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, WORK, 3*MAXN, INFO)
  call begin_test('left backtransform 4x4')
  call print_matrix('VL', VL, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 10: 6x6 with multiple complex pairs and real eigenvalues
  ! Structure:
  !   Rows 1-2: complex pair (eigenvalues 1 +/- 0.6i)
  !   Row 3: real eigenvalue (4.0)
  !   Row 4: real eigenvalue (5.0)
  !   Rows 5-6: complex pair (eigenvalues 7 +/- 0.5i)
  ! ============================================================
  N = 6
  T = 0.0d0; VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  ! 2x2 block at (1,1)-(2,2)
  T(1,1) = 1.0d0;  T(1,2) = 0.6d0
  T(2,1) = -0.6d0; T(2,2) = 1.0d0
  ! upper part: T(1,3:6), T(2,3:6)
  T(1,3) = 0.2d0; T(1,4) = 0.1d0; T(1,5) = 0.3d0; T(1,6) = 0.05d0
  T(2,3) = 0.15d0; T(2,4) = 0.08d0; T(2,5) = 0.12d0; T(2,6) = 0.04d0
  ! Real eigenvalue at (3,3)
  T(3,3) = 4.0d0
  T(3,4) = 0.5d0; T(3,5) = 0.2d0; T(3,6) = 0.1d0
  ! Real eigenvalue at (4,4)
  T(4,4) = 5.0d0
  T(4,5) = 0.3d0; T(4,6) = 0.15d0
  ! 2x2 block at (5,5)-(6,6)
  T(5,5) = 7.0d0;  T(5,6) = 0.5d0
  T(6,5) = -0.5d0; T(6,6) = 7.0d0

  call DTREVC3('R', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, &
               WORK, 3*MAXN, INFO)
  call begin_test('right all 6x6 mixed')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 11: Left eigenvectors for 6x6 (same T matrix)
  ! ============================================================
  VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  call DTREVC3('L', 'A', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, &
               WORK, 3*MAXN, INFO)
  call begin_test('left all 6x6 mixed')
  call print_matrix('VL', VL, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 12: Both eigenvectors, backtransform, 6x6
  ! ============================================================
  VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  do I = 1, N
    VR(I, I) = 1.0d0
    VL(I, I) = 1.0d0
  end do
  call DTREVC3('B', 'B', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, &
               WORK, 3*MAXN, INFO)
  call begin_test('both backtransform 6x6')
  call print_matrix('VR', VR, MAXN, N, N)
  call print_matrix('VL', VL, MAXN, N, N)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 13: Right selected, only real eigenvalues, 6x6
  ! Select eigenvalue at position 3 (real) and 4 (real)
  ! ============================================================
  VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  SELEC = .FALSE.
  SELEC(3) = .TRUE.
  SELEC(4) = .TRUE.
  call DTREVC3('R', 'S', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, &
               WORK, 3*MAXN, INFO)
  call begin_test('right selected real 6x6')
  call print_matrix('VR', VR, MAXN, N, M)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

  ! ============================================================
  ! Test 14: Left selected, only first complex pair, 6x6
  ! ============================================================
  VR = 0.0d0; VL = 0.0d0; WORK = 0.0d0
  SELEC = .FALSE.
  SELEC(1) = .TRUE.
  SELEC(2) = .TRUE.
  call DTREVC3('L', 'S', SELEC, N, T, MAXN, VL, MAXN, VR, MAXN, N, M, &
               WORK, 3*MAXN, INFO)
  call begin_test('left selected complex first 6x6')
  call print_matrix('VL', VL, MAXN, N, M)
  call print_int('M', M)
  call print_int('info', INFO)
  call end_test()

end program
