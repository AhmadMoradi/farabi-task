import { Box, Typography } from '@mui/material';

export default function Forbidden() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" gutterBottom>
        403
      </Typography>
      <Typography color="text.secondary">You do not have access to this page.</Typography>
    </Box>
  );
}
