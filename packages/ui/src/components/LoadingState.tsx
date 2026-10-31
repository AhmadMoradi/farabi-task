import { Box, CircularProgress } from '@mui/material';

export default function LoadingState({ fullPage }: { fullPage?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '100vh' : 200,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
