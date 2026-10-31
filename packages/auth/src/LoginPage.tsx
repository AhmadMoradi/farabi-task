import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router';

import { LoginInputSchema, type LoginInput } from '@farabitech/contracts';
import { useAuth } from './AuthProvider';

interface LoginPageProps {
  title: string;
  /** Optional helper text, e.g. demo credentials when running on the mock API. */
  hint?: string;
}

export function LoginPage({ title, hint }: LoginPageProps) {
  const { status, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginInputSchema) });

  if (status === 'authenticated') {
    return <Navigate to={from ? from.pathname + from.search : '/'} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
    } catch (error) {
      setError('root.serverError', {
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          <Typography variant="h5" component="h1">
            ورود به {title}
          </Typography>
          {hint && <Alert severity="info">{hint}</Alert>}
          {errors.root?.serverError && (
            <Alert severity="error">{errors.root.serverError.message}</Alert>
          )}
          <TextField
            label="ایمیل"
            type="email"
            autoComplete="username"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            dir="ltr"
          />
          <TextField
            label="رمز عبور"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            dir="ltr"
          />
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ورود...' : 'ورود'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
