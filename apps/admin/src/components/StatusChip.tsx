import { Chip } from '@mui/material';
import type { UserStatus } from '@farabitech/contracts';

export function StatusChip({ status }: { status: UserStatus }) {
  return (
    <Chip
      size="small"
      label={status}
      color={status === 'active' ? 'success' : 'default'}
      variant="outlined"
    />
  );
}
