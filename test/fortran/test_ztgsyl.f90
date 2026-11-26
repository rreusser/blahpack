program test_ztgsyl
  use test_utils
  implicit none

  integer, parameter :: MAXN = 10, LWORK = 800
  complex*16 :: A(MAXN, MAXN), B(MAXN, MAXN)
  complex*16 :: C(MAXN, MAXN), D(MAXN, MAXN)
  complex*16 :: E(MAXN, MAXN), F(MAXN, MAXN)
  complex*16 :: WORK(LWORK)
  double precision :: SCALE, DIF
  integer :: IWORK(MAXN*3), INFO
  integer :: M, N, i, j, idx
  character(len=1) :: TR
  integer :: IJ

  ! Pack buffers for printing complex matrices via EQUIVALENCE
  complex*16 :: Cpk(MAXN*MAXN), Fpk(MAXN*MAXN)
  double precision :: Cpk_r(2*MAXN*MAXN), Fpk_r(2*MAXN*MAXN)
  equivalence (Cpk, Cpk_r)
  equivalence (Fpk, Fpk_r)

  ! ========================================
  ! Test 1: TRANS='N', IJOB=0, M=2, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 2; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0)
  A(2,2) = (2.0d0, -0.3d0)

  B(1,1) = (3.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0)
  B(2,2) = (4.0d0, 0.2d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.1d0, 0.05d0)
  E(2,2) = (2.0d0, 0.1d0)

  F(1,1) = (5.0d0, 1.0d0); F(1,2) = (6.0d0, -1.0d0)
  F(2,1) = (7.0d0, 0.5d0); F(2,2) = (8.0d0, 0.2d0)

  call ZTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_2x2_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 2: TRANS='N', IJOB=0, M=3, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 3; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0); A(1,3) = (0.3d0, 0.1d0)
  A(2,2) = (2.0d0, -0.3d0); A(2,3) = (0.2d0, 0.0d0)
  A(3,3) = (3.0d0, 0.4d0)

  B(1,1) = (2.0d0, 0.1d0); B(1,2) = (0.4d0, -0.2d0)
  B(2,2) = (5.0d0, 0.3d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)
  C(3,1) = (5.0d0, -0.2d0); C(3,2) = (6.0d0, 0.7d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.1d0, 0.05d0); D(1,3) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0); D(2,3) = (0.3d0, 0.0d0)
  D(3,3) = (2.0d0, 0.2d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.2d0, 0.1d0)
  E(2,2) = (3.0d0, 0.1d0)

  F(1,1) = (7.0d0, 0.5d0); F(1,2) = (8.0d0, -1.0d0)
  F(2,1) = (9.0d0, 1.0d0); F(2,2) = (10.0d0, 0.3d0)
  F(3,1) = (11.0d0, -0.5d0); F(3,2) = (12.0d0, 0.2d0)

  call ZTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_3x2_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 3: TRANS='C' (conjugate-transpose), IJOB=0, M=2, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 2; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0)
  A(2,2) = (2.0d0, -0.3d0)

  B(1,1) = (3.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0)
  B(2,2) = (4.0d0, 0.2d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.1d0, 0.05d0)
  E(2,2) = (2.0d0, 0.1d0)

  F(1,1) = (5.0d0, 1.0d0); F(1,2) = (6.0d0, -1.0d0)
  F(2,1) = (7.0d0, 0.5d0); F(2,2) = (8.0d0, 0.2d0)

  call ZTGSYL('C', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('conjtrans_2x2_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 4: TRANS='N', IJOB=1 (solve + DIF estimate), M=2, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 2; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0)
  A(2,2) = (2.0d0, -0.3d0)

  B(1,1) = (3.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0)
  B(2,2) = (4.0d0, 0.2d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.1d0, 0.05d0)
  E(2,2) = (2.0d0, 0.1d0)

  F(1,1) = (5.0d0, 1.0d0); F(1,2) = (6.0d0, -1.0d0)
  F(2,1) = (7.0d0, 0.5d0); F(2,2) = (8.0d0, 0.2d0)

  call ZTGSYL('N', 1, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_2x2_ijob1')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 5: TRANS='N', IJOB=2, M=2, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 2; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0)
  A(2,2) = (2.0d0, -0.3d0)

  B(1,1) = (3.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0)
  B(2,2) = (4.0d0, 0.2d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.1d0, 0.05d0)
  E(2,2) = (2.0d0, 0.1d0)

  F(1,1) = (5.0d0, 1.0d0); F(1,2) = (6.0d0, -1.0d0)
  F(2,1) = (7.0d0, 0.5d0); F(2,2) = (8.0d0, 0.2d0)

  call ZTGSYL('N', 2, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_2x2_ijob2')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 6: TRANS='C', IJOB=0, M=3, N=3
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 3; N = 3

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.4d0, 0.1d0); A(1,3) = (0.1d0, 0.0d0)
  A(2,2) = (2.0d0, -0.3d0); A(2,3) = (0.2d0, 0.1d0)
  A(3,3) = (5.0d0, 0.2d0)

  B(1,1) = (2.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0); B(1,3) = (0.1d0, 0.0d0)
  B(2,2) = (3.0d0, 0.2d0); B(2,3) = (0.2d0, 0.1d0)
  B(3,3) = (6.0d0, -0.1d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0); C(1,3) = (3.0d0, 0.3d0)
  C(2,1) = (4.0d0, 1.0d0); C(2,2) = (5.0d0, 0.3d0); C(2,3) = (6.0d0, -0.2d0)
  C(3,1) = (7.0d0, -0.4d0); C(3,2) = (8.0d0, 0.7d0); C(3,3) = (9.0d0, 0.1d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.1d0, 0.05d0); D(1,3) = (0.05d0, 0.0d0)
  D(2,2) = (1.5d0, -0.1d0); D(2,3) = (0.2d0, 0.1d0)
  D(3,3) = (2.0d0, 0.2d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.2d0, 0.1d0); E(1,3) = (0.1d0, 0.0d0)
  E(2,2) = (2.5d0, 0.1d0); E(2,3) = (0.15d0, 0.05d0)
  E(3,3) = (3.0d0, -0.1d0)

  F(1,1) = (10.0d0, 1.0d0); F(1,2) = (11.0d0, -0.5d0); F(1,3) = (12.0d0, 0.3d0)
  F(2,1) = (13.0d0, 0.5d0); F(2,2) = (14.0d0, 0.2d0); F(2,3) = (15.0d0, -0.4d0)
  F(3,1) = (16.0d0, -0.3d0); F(3,2) = (17.0d0, 0.8d0); F(3,3) = (18.0d0, 0.1d0)

  call ZTGSYL('C', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('conjtrans_3x3_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 7: TRANS='N', IJOB=0, M=3, N=3
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 3; N = 3

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.4d0, 0.1d0); A(1,3) = (0.1d0, 0.0d0)
  A(2,2) = (2.0d0, -0.3d0); A(2,3) = (0.2d0, 0.1d0)
  A(3,3) = (5.0d0, 0.2d0)

  B(1,1) = (2.0d0, 0.1d0); B(1,2) = (0.3d0, -0.1d0); B(1,3) = (0.1d0, 0.0d0)
  B(2,2) = (3.0d0, 0.2d0); B(2,3) = (0.2d0, 0.1d0)
  B(3,3) = (6.0d0, -0.1d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0); C(1,3) = (3.0d0, 0.3d0)
  C(2,1) = (4.0d0, 1.0d0); C(2,2) = (5.0d0, 0.3d0); C(2,3) = (6.0d0, -0.2d0)
  C(3,1) = (7.0d0, -0.4d0); C(3,2) = (8.0d0, 0.7d0); C(3,3) = (9.0d0, 0.1d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.1d0, 0.05d0); D(1,3) = (0.05d0, 0.0d0)
  D(2,2) = (1.5d0, -0.1d0); D(2,3) = (0.2d0, 0.1d0)
  D(3,3) = (2.0d0, 0.2d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.2d0, 0.1d0); E(1,3) = (0.1d0, 0.0d0)
  E(2,2) = (2.5d0, 0.1d0); E(2,3) = (0.15d0, 0.05d0)
  E(3,3) = (3.0d0, -0.1d0)

  F(1,1) = (10.0d0, 1.0d0); F(1,2) = (11.0d0, -0.5d0); F(1,3) = (12.0d0, 0.3d0)
  F(2,1) = (13.0d0, 0.5d0); F(2,2) = (14.0d0, 0.2d0); F(2,3) = (15.0d0, -0.4d0)
  F(3,1) = (16.0d0, -0.3d0); F(3,2) = (17.0d0, 0.8d0); F(3,3) = (18.0d0, 0.1d0)

  call ZTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_3x3_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  ! ========================================
  ! Test 8: TRANS='C', IJOB=0, M=3, N=2
  ! ========================================
  A = (0.0d0, 0.0d0); B = (0.0d0, 0.0d0)
  C = (0.0d0, 0.0d0); D = (0.0d0, 0.0d0)
  E = (0.0d0, 0.0d0); F = (0.0d0, 0.0d0)
  M = 3; N = 2

  A(1,1) = (1.0d0, 0.5d0); A(1,2) = (0.5d0, 0.2d0); A(1,3) = (0.3d0, 0.1d0)
  A(2,2) = (2.0d0, -0.3d0); A(2,3) = (0.2d0, 0.0d0)
  A(3,3) = (3.0d0, 0.4d0)

  B(1,1) = (2.0d0, 0.1d0); B(1,2) = (0.4d0, -0.2d0)
  B(2,2) = (5.0d0, 0.3d0)

  C(1,1) = (1.0d0, 0.5d0); C(1,2) = (2.0d0, -0.5d0)
  C(2,1) = (3.0d0, 1.0d0); C(2,2) = (4.0d0, 0.3d0)
  C(3,1) = (5.0d0, -0.2d0); C(3,2) = (6.0d0, 0.7d0)

  D(1,1) = (1.0d0, 0.0d0); D(1,2) = (0.1d0, 0.05d0); D(1,3) = (0.2d0, 0.1d0)
  D(2,2) = (1.5d0, -0.1d0); D(2,3) = (0.3d0, 0.0d0)
  D(3,3) = (2.0d0, 0.2d0)

  E(1,1) = (1.0d0, 0.0d0); E(1,2) = (0.2d0, 0.1d0)
  E(2,2) = (3.0d0, 0.1d0)

  F(1,1) = (7.0d0, 0.5d0); F(1,2) = (8.0d0, -1.0d0)
  F(2,1) = (9.0d0, 1.0d0); F(2,2) = (10.0d0, 0.3d0)
  F(3,1) = (11.0d0, -0.5d0); F(3,2) = (12.0d0, 0.2d0)

  call ZTGSYL('C', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('conjtrans_3x2_ijob0')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()


  ! Blocked-path cases: ILAENV(2/5,'ZTGSYL') = 2 = MB = NB, so these M, N exceed the
  ! block sizes and take the blocked solver (including a merged last row/column).
  TR = 'N'; IJ = 1; M = 5; N = 4
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_5x4_ijob1_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  TR = 'C'; IJ = 0; M = 5; N = 4
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('conjtrans_5x4_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  TR = 'N'; IJ = 2; M = 5; N = 5
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_5x5_ijob2_merge')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  TR = 'N'; IJ = 0; M = 7; N = 6
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_7x6_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  TR = 'C'; IJ = 0; M = 7; N = 6
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('conjtrans_7x6_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

  TR = 'N'; IJ = 3; M = 5; N = 4
  call gen(M, N)
  call ZTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  do j = 1, N
    do i = 1, M
      idx = i + (j-1)*M
      Cpk(idx) = C(i, j)
      Fpk(idx) = F(i, j)
    end do
  end do
  call begin_test('notrans_5x4_ijob3_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_array('C', Cpk_r, 2*M*N)
  call print_array('F', Fpk_r, 2*M*N)
  call end_test()

contains

  ! Upper triangular (A,D) and (B,E) in complex Schur form.
  subroutine gen(mm, nn)
    integer, intent(in) :: mm, nn
    integer :: ii, jj
    A = (0.0d0, 0.0d0); B = A; C = A; D = A; E = A; F = A
    do jj = 1, mm
      do ii = 1, jj
        if (ii == jj) then
          A(ii,jj) = dcmplx(1.0d0 + dble(ii), 0.1d0*dble(ii))
          D(ii,jj) = dcmplx(1.0d0 + 0.1d0*dble(ii), 0.0d0)
        else
          A(ii,jj) = dcmplx(0.1d0*sin(dble(ii + 2*jj)), 0.1d0*cos(dble(ii + jj)))
          D(ii,jj) = dcmplx(0.05d0*cos(dble(ii + jj)), 0.02d0*sin(dble(ii)))
        end if
      end do
    end do
    do jj = 1, nn
      do ii = 1, jj
        if (ii == jj) then
          B(ii,jj) = dcmplx(-(1.0d0 + 0.5d0*dble(ii)), 0.2d0*dble(ii))
          E(ii,jj) = dcmplx(1.0d0 + 0.2d0*dble(ii), 0.0d0)
        else
          B(ii,jj) = dcmplx(0.1d0*cos(dble(2*ii + jj)), 0.05d0*sin(dble(jj)))
          E(ii,jj) = dcmplx(0.05d0*sin(dble(ii + jj)), 0.03d0*cos(dble(jj)))
        end if
      end do
    end do
    do jj = 1, nn
      do ii = 1, mm
        C(ii,jj) = dcmplx(dble(ii) + 0.5d0*dble(jj), 0.25d0*dble(ii - jj))
        F(ii,jj) = dcmplx(1.0d0 + sin(dble(ii*jj)), cos(dble(ii + jj)))
      end do
    end do
  end subroutine gen

end program
