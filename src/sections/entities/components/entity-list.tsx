'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { entityAPI } from 'src/lib/api/entities';

import type { EntityTypeName, BaseEntity } from 'src/types/entities';

// ----------------------------------------------------------------------

interface EntityListProps {
  entityType: EntityTypeName;
  onEdit?: (entity: BaseEntity) => void;
  onDelete?: (entity: BaseEntity) => void;
  refreshTrigger?: number;
}

export function EntityList({ entityType, onEdit, onDelete, refreshTrigger }: EntityListProps) {
  const [entities, setEntities] = useState<BaseEntity[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { entities: data, rawResponse: raw } = await entityAPI.listWithRaw<BaseEntity>(entityType);
      setEntities(data);
      setRawResponse(raw);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRawResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, refreshTrigger]);

  const handleDelete = async (entity: BaseEntity) => {
    if (!window.confirm(`Delete this ${entityType}?`)) return;

    try {
      await entityAPI.delete(entityType, entity.id);
      fetchEntities();
      onDelete?.(entity);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getDisplayName = (entity: any): string => {
    return entity.title || entity.name || entity.id;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchEntities} sx={{ mt: 2 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Entity List Card */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)} List ({entities.length})
            </Typography>
            <Button
              size="small"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={fetchEntities}
            >
              Refresh
            </Button>
          </Box>

          {entities.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No {entityType} entities found. Create one using the form above.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name/Title</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {getDisplayName(entity)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {entity.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entity.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => onEdit?.(entity)}
                          title="Edit"
                        >
                          <Iconify icon="solar:pen-bold" width={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(entity)}
                          title="Delete"
                          color="error"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Raw API Response Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            API Response (Raw JSON)
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.900',
              color: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
          >
            {rawResponse ? JSON.stringify(rawResponse, null, 2) : 'No response data'}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

