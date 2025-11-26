'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { insightAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { InsightSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { InsightFormData } from '../schemas';

// ----------------------------------------------------------------------

interface InsightFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function InsightForm({ userId, onSuccess, onError }: InsightFormProps) {
  const methods = useForm({
    resolver: zodResolver(InsightSchema) as any,
    defaultValues: {
      title: '',
      atlasId: '',
      description: '',
      explanation: '',
      artificial: false,
      userId: userId || '',
      focusId: '',
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
        Object.entries(data).filter(([_, v]) => v !== '')
      ) as any;

      await insightAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
      <Field.Text name="atlasId" label="Atlas ID" required helperText="Insight must belong to an Atlas" />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="explanation" label="Explanation" multiline rows={4} />
      <Field.Switch name="artificial" label="AI Generated" />
      <Field.Text name="userId" label="User ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Insight"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Insight"
      />
    </Form>
  );
}

