program test_dtgsyl
  use test_utils
  implicit none

  integer, parameter :: MAXN = 10, LWORK = 400
  double precision :: A(MAXN, MAXN), B(MAXN, MAXN)
  double precision :: C(MAXN, MAXN), D(MAXN, MAXN)
  double precision :: E(MAXN, MAXN), F(MAXN, MAXN)
  double precision :: SCALE, DIF, WORK(LWORK)
  integer :: IWORK(MAXN*3), INFO
  integer :: M, N
  character(len=1) :: TR
  integer :: IJ

  ! Test 1: 2x2 diagonal, IJOB=0, TRANS='N'
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 2; N = 2

  A(1,1) = 1.0d0; A(1,2) = 0.5d0
  A(2,2) = 2.0d0

  B(1,1) = 3.0d0; B(1,2) = 0.3d0
  B(2,2) = 4.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0
  C(2,1) = 3.0d0; C(2,2) = 4.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.2d0
  D(2,2) = 1.5d0

  E(1,1) = 1.0d0; E(1,2) = 0.1d0
  E(2,2) = 2.0d0

  F(1,1) = 5.0d0; F(1,2) = 6.0d0
  F(2,1) = 7.0d0; F(2,2) = 8.0d0

  call DTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_2x2')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 2: 3x2 with 2x2 block in A, IJOB=0
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 3; N = 2

  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0
  A(3,3) = 3.0d0

  B(1,1) = 2.0d0; B(1,2) = 0.4d0
  B(2,2) = 5.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0
  C(2,1) = 3.0d0; C(2,2) = 4.0d0
  C(3,1) = 5.0d0; C(3,2) = 6.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.1d0; D(1,3) = 0.2d0
  D(2,2) = 1.5d0; D(2,3) = 0.3d0
  D(3,3) = 2.0d0

  E(1,1) = 1.0d0; E(1,2) = 0.2d0
  E(2,2) = 3.0d0

  F(1,1) = 7.0d0; F(1,2) = 8.0d0
  F(2,1) = 9.0d0; F(2,2) = 10.0d0
  F(3,1) = 11.0d0; F(3,2) = 12.0d0

  call DTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_3x2_quasi')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 3: Transposed 2x2
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 2; N = 2

  A(1,1) = 1.0d0; A(1,2) = 0.5d0
  A(2,2) = 2.0d0

  B(1,1) = 3.0d0; B(1,2) = 0.3d0
  B(2,2) = 4.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0
  C(2,1) = 3.0d0; C(2,2) = 4.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.2d0
  D(2,2) = 1.5d0

  E(1,1) = 1.0d0; E(1,2) = 0.1d0
  E(2,2) = 2.0d0

  F(1,1) = 5.0d0; F(1,2) = 6.0d0
  F(2,1) = 7.0d0; F(2,2) = 8.0d0

  call DTGSYL('T', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('trans_2x2')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 4: 3x3 with quasi-triangular blocks, IJOB=0
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 3; N = 3

  A(1,1) = 1.0d0; A(1,2) = 0.4d0; A(1,3) = 0.1d0
  A(2,1) = -0.4d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0
  A(3,3) = 5.0d0

  B(1,1) = 2.0d0; B(1,2) = 0.3d0; B(1,3) = 0.1d0
  B(2,1) = -0.3d0; B(2,2) = 2.0d0; B(2,3) = 0.2d0
  B(3,3) = 6.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.1d0; D(1,3) = 0.05d0
  D(2,2) = 1.5d0; D(2,3) = 0.2d0
  D(3,3) = 2.0d0

  E(1,1) = 1.0d0; E(1,2) = 0.2d0; E(1,3) = 0.1d0
  E(2,2) = 2.5d0; E(2,3) = 0.15d0
  E(3,3) = 3.0d0

  F(1,1) = 10.0d0; F(1,2) = 11.0d0; F(1,3) = 12.0d0
  F(2,1) = 13.0d0; F(2,2) = 14.0d0; F(2,3) = 15.0d0
  F(3,1) = 16.0d0; F(3,2) = 17.0d0; F(3,3) = 18.0d0

  call DTGSYL('N', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_3x3_quasi')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 5: Transpose with 3x2 quasi
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 3; N = 2

  A(1,1) = 1.0d0; A(1,2) = 0.5d0; A(1,3) = 0.3d0
  A(2,1) = -0.5d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0
  A(3,3) = 3.0d0

  B(1,1) = 2.0d0; B(1,2) = 0.4d0
  B(2,2) = 5.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0
  C(2,1) = 3.0d0; C(2,2) = 4.0d0
  C(3,1) = 5.0d0; C(3,2) = 6.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.1d0; D(1,3) = 0.2d0
  D(2,2) = 1.5d0; D(2,3) = 0.3d0
  D(3,3) = 2.0d0

  E(1,1) = 1.0d0; E(1,2) = 0.2d0
  E(2,2) = 3.0d0

  F(1,1) = 7.0d0; F(1,2) = 8.0d0
  F(2,1) = 9.0d0; F(2,2) = 10.0d0
  F(3,1) = 11.0d0; F(3,2) = 12.0d0

  call DTGSYL('T', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('trans_3x2_quasi')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 6: ijob=1 (solve + estimate DIF)
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 2; N = 2

  A(1,1) = 1.0d0; A(1,2) = 0.5d0
  A(2,2) = 2.0d0

  B(1,1) = 3.0d0; B(1,2) = 0.3d0
  B(2,2) = 4.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0
  C(2,1) = 3.0d0; C(2,2) = 4.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.2d0
  D(2,2) = 1.5d0

  E(1,1) = 1.0d0; E(1,2) = 0.1d0
  E(2,2) = 2.0d0

  F(1,1) = 5.0d0; F(1,2) = 6.0d0
  F(2,1) = 7.0d0; F(2,2) = 8.0d0

  call DTGSYL('N', 1, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_2x2_ijob1')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  ! Test 8: Transpose 3x3 both quasi
  A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
  M = 3; N = 3

  A(1,1) = 1.0d0; A(1,2) = 0.4d0; A(1,3) = 0.1d0
  A(2,1) = -0.4d0; A(2,2) = 1.0d0; A(2,3) = 0.2d0
  A(3,3) = 5.0d0

  B(1,1) = 2.0d0; B(1,2) = 0.3d0; B(1,3) = 0.1d0
  B(2,1) = -0.3d0; B(2,2) = 2.0d0; B(2,3) = 0.2d0
  B(3,3) = 6.0d0

  C(1,1) = 1.0d0; C(1,2) = 2.0d0; C(1,3) = 3.0d0
  C(2,1) = 4.0d0; C(2,2) = 5.0d0; C(2,3) = 6.0d0
  C(3,1) = 7.0d0; C(3,2) = 8.0d0; C(3,3) = 9.0d0

  D(1,1) = 1.0d0; D(1,2) = 0.1d0; D(1,3) = 0.05d0
  D(2,2) = 1.5d0; D(2,3) = 0.2d0
  D(3,3) = 2.0d0

  E(1,1) = 1.0d0; E(1,2) = 0.2d0; E(1,3) = 0.1d0
  E(2,2) = 2.5d0; E(2,3) = 0.15d0
  E(3,3) = 3.0d0

  F(1,1) = 10.0d0; F(1,2) = 11.0d0; F(1,3) = 12.0d0
  F(2,1) = 13.0d0; F(2,2) = 14.0d0; F(2,3) = 15.0d0
  F(3,1) = 16.0d0; F(3,2) = 17.0d0; F(3,3) = 18.0d0

  call DTGSYL('T', 0, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('trans_3x3_quasi')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()


  ! Blocked-path cases: ILAENV(2/5,'DTGSYL') = 2 = MB = NB, so these M, N exceed the
  ! block sizes and take the blocked solver (block starts, 2x2 bumps, a merged last row).
  TR = 'N'; IJ = 1; M = 5; N = 4
  call gen(M, N, 3, 0)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_5x4_ijob1_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  TR = 'T'; IJ = 0; M = 5; N = 4
  call gen(M, N, 3, 0)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('trans_5x4_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  TR = 'N'; IJ = 2; M = 5; N = 5
  call gen(M, N, 0, 0)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_5x5_ijob2_merge')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  TR = 'N'; IJ = 0; M = 7; N = 6
  call gen(M, N, 0, 3)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_7x6_bumpB')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  TR = 'T'; IJ = 0; M = 7; N = 6
  call gen(M, N, 0, 3)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('trans_7x6_bumpB')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

  TR = 'N'; IJ = 3; M = 5; N = 4
  call gen(M, N, 3, 0)
  call DTGSYL(TR, IJ, M, N, A, MAXN, B, MAXN, C, MAXN, &
              D, MAXN, E, MAXN, F, MAXN, SCALE, DIF, WORK, LWORK, &
              IWORK, INFO)
  call begin_test('notrans_5x4_ijob3_blocked')
  call print_int('info', INFO)
  call print_scalar('scale', SCALE)
  call print_scalar('dif', DIF)
  call print_matrix('C', C, MAXN, M, N)
  call print_matrix('F', F, MAXN, M, N)
  call end_test()

contains

  ! Upper (quasi-)triangular (A,D) and (B,E); a 2x2 bump at row/column ba/bb (0 = none).
  subroutine gen(mm, nn, ba, bb)
    integer, intent(in) :: mm, nn, ba, bb
    integer :: i, j
    A = 0.0d0; B = 0.0d0; C = 0.0d0; D = 0.0d0; E = 0.0d0; F = 0.0d0
    do j = 1, mm
      do i = 1, j
        if (i == j) then
          A(i,j) = 1.0d0 + dble(i)
          D(i,j) = 1.0d0 + 0.1d0*dble(i)
        else
          A(i,j) = 0.1d0*sin(dble(i + 2*j))
          D(i,j) = 0.05d0*cos(dble(i + j))
        end if
      end do
    end do
    if (ba > 0) then
      A(ba-1,ba-1) = A(ba,ba); A(ba-1,ba) = 0.5d0; A(ba,ba-1) = -0.5d0
      D(ba-1,ba) = 0.0d0
    end if
    do j = 1, nn
      do i = 1, j
        if (i == j) then
          B(i,j) = -(1.0d0 + 0.5d0*dble(i))
          E(i,j) = 1.0d0 + 0.2d0*dble(i)
        else
          B(i,j) = 0.1d0*cos(dble(2*i + j))
          E(i,j) = 0.05d0*sin(dble(i + j))
        end if
      end do
    end do
    if (bb > 0) then
      B(bb-1,bb-1) = B(bb,bb); B(bb-1,bb) = 0.4d0; B(bb,bb-1) = -0.4d0
      E(bb-1,bb) = 0.0d0
    end if
    do j = 1, nn
      do i = 1, mm
        C(i,j) = dble(i) + 0.5d0*dble(j)
        F(i,j) = 1.0d0 + sin(dble(i*j))
      end do
    end do
  end subroutine gen

end program
