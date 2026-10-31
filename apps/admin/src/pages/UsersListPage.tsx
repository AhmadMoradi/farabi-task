import { useDeferredValue, useState } from 'react';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import { Link } from 'react-router';

import { ErrorState, LoadingState, PageHeader } from '@farabitech/ui';

import { StatusChip } from '../components/StatusChip';
import { useUsersList } from '../queries';

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data, isPending, error, refetch } = useUsersList({
    page,
    pageSize,
    search: deferredSearch,
  });

  return (
    <>
      <PageHeader title="کاربران" subtitle="مدیریت کاربران سامانه" />
      <TextField
        label="جستجو"
        size="small"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 2, minWidth: 280 }}
      />
      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>ایمیل</TableCell>
                  <TableCell>نقش</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell dir="ltr" align="right">
                      {user.email}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <StatusChip status={user.status} />
                    </TableCell>
                    <TableCell align="left">
                      <Button size="small" component={Link} to={`/users/${user.id}`}>
                        ویرایش
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      کاربری یافت نشد
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.total}
            page={page - 1}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, next) => setPage(next + 1)}
            onRowsPerPageChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          />
        </Paper>
      )}
    </>
  );
}
