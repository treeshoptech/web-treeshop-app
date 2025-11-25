'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
} from '@mui/material';

export interface SummaryTableColumn {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  minWidth?: number;
  format?: (value: string | number | null | undefined) => string;
}

export interface SummaryTableRow {
  [key: string]: string | number | null | undefined;
}

export interface SummaryTableProps {
  columns: SummaryTableColumn[];
  rows: SummaryTableRow[];
  color?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

type Order = 'asc' | 'desc';

export default function SummaryTable({
  columns,
  rows,
  color = '#007AFF',
  stickyHeader = true,
  maxHeight = 400,
}: SummaryTableProps) {
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id || '');
  const [order, setOrder] = useState<Order>('asc');

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedRows = [...rows].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    // Handle different data types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // String comparison
    const aString = String(aValue || '').toLowerCase();
    const bString = String(bValue || '').toLowerCase();

    if (aString < bString) {
      return order === 'asc' ? -1 : 1;
    }
    if (aString > bString) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        background: '#1C1C1E',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        maxHeight,
        '&::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
          },
        },
      }}
    >
      <Table stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  minWidth: column.minWidth,
                  background: '#1C1C1E',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#8E8E93',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  py: 2,
                }}
              >
                {column.sortable !== false ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                    sx={{
                      color: '#8E8E93 !important',
                      '&.Mui-active': {
                        color: `${color} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${color} !important`,
                        },
                      },
                      '&:hover': {
                        color: '#FFFFFF !important',
                      },
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.length > 0 ? (
            sortedRows.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.02)',
                  },
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                {columns.map((column) => {
                  const value = row[column.id];
                  const displayValue = column.format ? column.format(value) : value;

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        color: '#FFFFFF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        py: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{
                  textAlign: 'center',
                  py: 6,
                  color: '#8E8E93',
                  borderBottom: 0,
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    No data available
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.8125rem' }}>
                    Data will appear here once available
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
