import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Chip, Paper, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

import { ApiError } from '@farabitech/api-client';
import { useCurrentUser } from '@farabitech/auth';
import { UpdateProfileInputSchema, type UpdateProfileInput } from '@farabitech/contracts';
import { PageHeader } from '@farabitech/ui';

import { useUpdateProfile } from '../queries';

export default function ProfilePage() {
  const user = useCurrentUser();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileInputSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  useEffect(() => {
    reset({ name: user.name, email: user.email });
  }, [user, reset]);

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
        title="پروفایل من"
        subtitle="اطلاعات حساب کاربری"
        actions={<Chip label={user.role} size="small" variant="outlined" />}
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
          <Button type="submit" variant="contained" disabled={!isDirty || update.isPending}>
            {update.isPending ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
