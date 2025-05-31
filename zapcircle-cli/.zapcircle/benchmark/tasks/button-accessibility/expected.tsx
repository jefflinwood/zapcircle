export function Button({ children, ariaLabel }) {
  return <button aria-label={ariaLabel}>{children}</button>;
}