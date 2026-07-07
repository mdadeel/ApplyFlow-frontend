import { Button } from './Button';
import type { ButtonProps } from './Button';

export function IconButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="icon" size="md" {...props} />;
}
