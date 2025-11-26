'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { archetypeAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { ArchetypeSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { ArchetypeFormData } from '../schemas';

// ----------------------------------------------------------------------

interface ArchetypeFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function ArchetypeForm({ onSuccess, onError }: ArchetypeFormProps) {
  const methods = useForm<ArchetypeFormData>({
    resolver: zodResolver(ArchetypeSchema),
    defaultValues: {
      name: '', // Note: Archetype uses 'name' not 'title'
      atlasId: '',
      description: '',
      focusId: '',
      // Nested arrays - empty by default
      notions: [],
      traits: [],
      values: [],
      motivations: [],
      logs: [],
      categories: [],
      strengths: [],
      flaws: [],
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '' && !(Array.isArray(v) && v.length === 0))
      ) as any;

      await archetypeAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="name" label="Name" required helperText="Archetype uses 'name' instead of 'title'" />
      <Field.Text name="atlasId" label="Atlas ID" required helperText="Archetype must belong to an Atlas" />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="focusId" label="Focus ID" />
      {/* Note: Nested arrays (traits, values, etc.) would need dynamic field array components */}
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Archetype"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Archetype"
      />
    </Form>
  );
}

