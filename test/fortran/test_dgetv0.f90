program test_dgetv0
  use test_utils
  implicit none
  integer, parameter :: LDV = 8
  double precision :: v(LDV, 8), resid(8), workd(16), a(8, 8)
  integer :: ipntr(3), ido, ierr, n, j, i, k
  double precision :: rnorm

  ! ------------------------------------------------------------------
  ! Case 1: bmat='I', j=1, initv=.false. — random start (dlarnv, fixed seed),
  ! OP = A applied once. This is the only case that draws from the seed.
  n = 5
  j = 1
  call build_a(a, LDV, n)
  ido = 0
  ierr = 0
  call run_rc(ido, 'I', 1, .false., n, j, v, LDV, resid, rnorm, ipntr, workd, ierr, a)
  call begin_test('I_rand_j1_n5')
  call print_array('resid', resid, n)
  call print_scalar('rnorm', rnorm)
  call print_int('ierr', ierr)
  call print_int('ido', ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: bmat='I', j=3, initv=.true. — known start, orthogonalize against
  ! V(:,1:2) = [e1, e2]. Exercises the reorthogonalization loop (I path).
  n = 5
  j = 3
  call build_a(a, LDV, n)
  v = 0.0d0
  v(1, 1) = 1.0d0
  v(2, 2) = 1.0d0
  resid(1:5) = [ 0.6d0, -1.1d0, 2.3d0, 0.4d0, -1.7d0 ]
  ido = 0
  ierr = 0
  call run_rc(ido, 'I', 1, .true., n, j, v, LDV, resid, rnorm, ipntr, workd, ierr, a)
  call begin_test('I_orth_j3_n5')
  call print_array('resid', resid, n)
  call print_scalar('rnorm', rnorm)
  call print_int('ierr', ierr)
  call print_int('ido', ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: bmat='G', j=3, initv=.true., B = I (so B*x = x) and OP = A.
  ! Exercises the ido=2 (B*x) reverse-communication returns.
  n = 5
  j = 3
  call build_a(a, LDV, n)
  v = 0.0d0
  v(1, 1) = 1.0d0
  v(2, 2) = 1.0d0
  resid(1:5) = [ 0.6d0, -1.1d0, 2.3d0, 0.4d0, -1.7d0 ]
  ido = 0
  ierr = 0
  call run_rc_g(ido, 'G', 1, .true., n, j, v, LDV, resid, rnorm, ipntr, workd, ierr, a)
  call begin_test('G_orth_j3_n5')
  call print_array('resid', resid, n)
  call print_scalar('rnorm', rnorm)
  call print_int('ierr', ierr)
  call print_int('ido', ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: bmat='I', j=2, initv=.true., n=4, a different matrix.
  n = 4
  j = 2
  a = 0.0d0
  do i = 1, n
    a(i, i) = dble(i) + 1.0d0
    do k = 1, n
      if (i /= k) a(i, k) = 0.25d0 * dble(i + k)
    end do
  end do
  v = 0.0d0
  v(1, 1) = 1.0d0
  resid(1:4) = [ 1.0d0, 0.5d0, -0.5d0, 2.0d0 ]
  ido = 0
  ierr = 0
  call run_rc(ido, 'I', 1, .true., n, j, v, LDV, resid, rnorm, ipntr, workd, ierr, a)
  call begin_test('I_orth_j2_n4')
  call print_array('resid', resid, n)
  call print_scalar('rnorm', rnorm)
  call print_int('ierr', ierr)
  call print_int('ido', ido)
  call end_test()

contains

  subroutine build_a(a, lda, n)
    integer, intent(in) :: lda, n
    double precision, intent(out) :: a(lda, *)
    integer :: i
    a(1:n, 1:n) = 0.0d0
    do i = 1, n
      a(i, i) = 2.0d0 + 0.5d0 * dble(i)
      if (i < n) then
        a(i, i+1) = -1.0d0
        a(i+1, i) = -1.0d0
      end if
    end do
  end subroutine build_a

  ! Drive dgetv0 with OP = A, standard problem (bmat='I'): only ido=-1 returns.
  subroutine run_rc(ido, bmat, itry, initv, n, j, v, ldv, resid, rnorm, ipntr, workd, ierr, a)
    integer, intent(inout) :: ido, ierr
    character, intent(in) :: bmat
    integer, intent(in) :: itry, n, j, ldv
    logical, intent(in) :: initv
    double precision, intent(inout) :: v(ldv, *), resid(*), workd(*), rnorm
    integer, intent(inout) :: ipntr(3)
    double precision, intent(in) :: a(ldv, *)
    integer :: p, q, r, c
    do
      call dgetv0(ido, bmat, itry, initv, n, j, v, ldv, resid, rnorm, ipntr, workd, ierr)
      if (ido == 99) exit
      if (ido == -1 .or. ido == 1) then
        p = ipntr(1)
        q = ipntr(2)
        do r = 1, n
          workd(q + r - 1) = 0.0d0
          do c = 1, n
            workd(q + r - 1) = workd(q + r - 1) + a(r, c) * workd(p + c - 1)
          end do
        end do
      else
        exit
      end if
    end do
  end subroutine run_rc

  ! Drive dgetv0 for the generalized problem (bmat='G') with B = I:
  ! ido=-1 applies OP=A, ido=2 applies B=I (a copy).
  subroutine run_rc_g(ido, bmat, itry, initv, n, j, v, ldv, resid, rnorm, ipntr, workd, ierr, a)
    integer, intent(inout) :: ido, ierr
    character, intent(in) :: bmat
    integer, intent(in) :: itry, n, j, ldv
    logical, intent(in) :: initv
    double precision, intent(inout) :: v(ldv, *), resid(*), workd(*), rnorm
    integer, intent(inout) :: ipntr(3)
    double precision, intent(in) :: a(ldv, *)
    integer :: p, q, r, c
    do
      call dgetv0(ido, bmat, itry, initv, n, j, v, ldv, resid, rnorm, ipntr, workd, ierr)
      if (ido == 99) exit
      p = ipntr(1)
      q = ipntr(2)
      if (ido == -1 .or. ido == 1) then
        do r = 1, n
          workd(q + r - 1) = 0.0d0
          do c = 1, n
            workd(q + r - 1) = workd(q + r - 1) + a(r, c) * workd(p + c - 1)
          end do
        end do
      else if (ido == 2) then
        do r = 1, n
          workd(q + r - 1) = workd(p + r - 1)
        end do
      else
        exit
      end if
    end do
  end subroutine run_rc_g

end program test_dgetv0
