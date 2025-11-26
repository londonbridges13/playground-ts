'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { polarityAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { PolaritySchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { PolarityFormData } from '../schemas';

// ----------------------------------------------------------------------

interface PolarityFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PolarityForm({ userId, onSuccess, onError }: PolarityFormProps) {
  const methods = useForm<PolarityFormData>({
    resolver: zodResolver(PolaritySchema),
    defaultValues: {
      title: '',
      description: '',
      userId: userId || '',
      atlasId: '',
      focusId: '',
      // Nested arrays
      powerLaws: [],
      keyConsiderations: [],
      questionsToExplore: [],
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

      await polarityAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="userId" label="User ID" />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="focusId" label="Focus ID" />
      {/* Note: Nested arrays (powerLaws, keyConsiderations, questionsToExplore) would need dynamic field array components */}
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Polarity"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Polarity"
      />
    </Form>
  );
}

