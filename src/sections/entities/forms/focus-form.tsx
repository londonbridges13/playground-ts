'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { focusAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { FocusSchema, layoutOptions, viewModeOptions } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { FocusFormData } from '../schemas';

// ----------------------------------------------------------------------

interface FocusFormProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function FocusForm({ userId, onSuccess, onError }: FocusFormProps) {
  const methods = useForm<FocusFormData>({
    resolver: zodResolver(FocusSchema),
    defaultValues: {
      title: '',
      interfaceLayout: 'grid',
      interfaceViewMode: 'compact',
      userId,
      description: '',
      imageUrl: '',
      metadata: '',
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
      // Build interface object from separate fields
      const interfaceConfig = {
        layout: data.interfaceLayout,
        viewMode: data.interfaceViewMode,
      };

      // Parse metadata if provided
      let parsedMetadata;
      if (data.metadata) {
        try {
          parsedMetadata = JSON.parse(data.metadata);
        } catch {
          throw new Error('Invalid JSON in metadata field');
        }
      }

      const submitData = {
        title: data.title,
        interface: interfaceConfig,
        userId: data.userId,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        metadata: parsedMetadata,
        atlasId: data.atlasId || undefined,
        pathId: data.pathId || undefined,
      };

      const cleanData = Object.fromEntries(
        Object.entries(submitData).filter(([_, v]) => v !== undefined && v !== '')
      ) as any;

      await focusAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
      <Field.Select name="interfaceLayout" label="Layout" required>
        {layoutOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field.Select>
      <Field.Select name="interfaceViewMode" label="View Mode" required>
        {viewModeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field.Select>
      <Field.Text name="userId" label="User ID" required disabled />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="imageUrl" label="Image URL" />
      <Field.Text
        name="metadata"
        label="Metadata (JSON)"
        multiline
        rows={4}
        helperText="Optional JSON object for theme, dates, priorities"
      />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="pathId" label="Path ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Focus"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Focus"
      />
    </Form>
  );
}

