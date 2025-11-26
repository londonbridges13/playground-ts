'use client';

import type { SelectChangeEvent } from '@mui/material/Select';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import type { EntityTypeName } from 'src/types/entities';

// ----------------------------------------------------------------------

const ENTITY_TABS: { value: EntityTypeName; label: string }[] = [
  { value: 'atlas', label: 'Atlas' },
  { value: 'path', label: 'Path' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'horizon', label: 'Horizon' },
  { value: 'pathway', label: 'Pathway' },
  { value: 'story', label: 'Story' },
  { value: 'insight', label: 'Insight' },
  { value: 'archetype', label: 'Archetype' },
  { value: 'polarity', label: 'Polarity' },
  { value: 'steps', label: 'Steps' },
  { value: 'basis', label: 'Basis' },
  { value: 'focus', label: 'Focus' },
  { value: 'discovery', label: 'Discovery' },
];

interface EntityTabsProps {
  currentTab: EntityTypeName;
  onTabChange: (tab: EntityTypeName) => void;
}

export function EntityTabs({ currentTab, onTabChange }: EntityTabsProps) {
  const handleChange = (event: SelectChangeEvent<EntityTypeName>) => {
    onTabChange(event.target.value as EntityTypeName);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
        <InputLabel id="entity-type-label">Entity Type</InputLabel>
        <Select
          labelId="entity-type-label"
          id="entity-type-select"
          value={currentTab}
          label="Entity Type"
          onChange={handleChange}
        >
          {ENTITY_TABS.map((tab) => (
            <MenuItem key={tab.value} value={tab.value}>
              {tab.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export { ENTITY_TABS };

