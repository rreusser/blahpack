# zgttrs: Translation Learnings

## Translation pitfalls

- Simple wrapper. Maps long-form strings to integer itrans for zgtts2.
- Complex version has three modes (N/T/C) vs real's two (N/T).

## Dependency interface surprises

- zgtts2 B strides are Float64-based, not complex-element-based.

## Missing automation

- N/A

## Coverage gaps

- N/A

## Complex number handling

- Delegated to zgtts2.
