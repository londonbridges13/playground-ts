'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { basisAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { BasisSchema, entityTypeOptions } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { BasisFormData } from '../schemas';

// ----------------------------------------------------------------------

interface BasisFormProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function BasisForm({ userId, onSuccess, onError }: BasisFormProps) {
  const methods = useForm<BasisFormData>({
    resolver: zodResolver(BasisSchema),
    defaultValues: {
      title: '',
      entityType: '',
      metadata: '{}',
      userId,
      description: '',
      imageUrl: '',
      sourceEntityId: '',
      atlasId: '',
      pathId: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Parse metadata JSON
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(data.metadata);
      } catch {
        throw new Error('Invalid JSON in metadata field');
      }

      const cleanData = Object.fromEntries(
        Object.entries({ ...data, metadata: parsedMetadata }).filter(([_, v]) => v !== '')
      ) as any;

      await basisAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
      <Field.Select
        name="entityType"
        label="Entity Type"
        required
      >
        {entityTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field.Select>
      <Field.Text
        name="metadata"
        label="Metadata (JSON)"
        required
        multiline
        rows={6}
        helperText="Enter valid JSON object"
      />
      <Field.Text name="userId" label="User ID" required disabled />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="imageUrl" label="Image URL" />
      <Field.Text name="sourceEntityId" label="Source Entity ID" />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="pathId" label="Path ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Basis"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Basis"
      />
    </Form>
  );
}

