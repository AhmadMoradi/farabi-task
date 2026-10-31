import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, MenuItem, Paper, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router';

import { ApiError } from '@farabitech/api-client';
import { UpdateUserInputSchema, type UpdateUserInput } from '@farabitech/contracts';
import { ErrorState, LoadingState, PageHeader } from '@farabitech/ui';

import { useUpdateUser, useUser } from '../queries';

export default function UserEditPage() {
  const { id = '' } = useParams();
  const { data: user, isPending, error, refetch } = useUser(id);
  const update = useUpdateUser(id);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateUserInput>({ resolver: zodResolver(UpdateUserInputSchema) });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, role: user.role, status: user.status });
    }
  }, [user, reset]);

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'email_taken') {
        setError('email', { message: 'این ایمیل قبلا استفاده شده است' });
      } else {
        setError('root.serverError', {
          message: e instanceof Error ? e.message : 'Update failed',
        });
      }
    }
  });

  return (
    <>
      <PageHeader
        title="ویرایش کاربر"
        subtitle={user.email}
        actions={
          <Button component={Link} to="/users">
            بازگشت
          </Button>
        }
      />
      <Paper sx={{ p: 3, maxWidth: 480 }}>
        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          {errors.root?.serverError && (
            <Alert severity="error">{errors.root.serverError.message}</Alert>
          )}
          {update.isSuccess && !isDirty && <Alert severity="success">تغییرات ذخیره شد</Alert>}
          <TextField
            label="نام"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="ایمیل"
            type="email"
            dir="ltr"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <Controller
            control={control}
            name="role"
            defaultValue={user.role}
            render={({ field }) => (
              <TextField select label="نقش" {...field}>
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="member">member</MenuItem>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="status"
            defaultValue={user.status}
            render={({ field }) => (
              <TextField select label="وضعیت" {...field}>
                <MenuItem value="active">active</MenuItem>
                <MenuItem value="suspended">suspended</MenuItem>
              </TextField>
            )}
          />
          <Button type="submit" variant="contained" disabled={!isDirty || update.isPending}>
            {update.isPending ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
