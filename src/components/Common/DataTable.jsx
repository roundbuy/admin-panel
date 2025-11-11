import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  totalRows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  onApprove,
  onReject,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  loading = false,
  actions = true,
  customActions = []
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={onSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Loading...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" color="text.secondary">No Records Found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no records to display at this time.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    key={row.id || index}
                    selected={isItemSelected}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => onSelectRow(event, row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    {actions && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {onView && (
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => onView(row)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => onEdit(row)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onApprove && (
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success" onClick={() => onApprove(row)}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onReject && (
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" onClick={() => onReject(row)}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {customActions.map((action, idx) => (
                            <Tooltip key={idx} title={action.label}>
                              <IconButton
                                size="small"
                                color={action.color || 'default'}
                                onClick={() => action.onClick(row)}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          ))}
                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalRows > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DataTable;