'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { stepsAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { StepsSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { StepsFormData } from '../schemas';

// ----------------------------------------------------------------------

interface StepsFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function StepsForm({ onSuccess, onError }: StepsFormProps) {
  const methods = useForm({
    resolver: zodResolver(StepsSchema) as any,
    defaultValues: {
      title: '',
      order: 0,
      description: '',
      isComplete: false,
      pathwayId: '',
      milestoneId: '',
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

      await stepsAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
      <Field.Text name="order" label="Order" type="number" required helperText="Position in sequence (0, 1, 2...)" />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Switch name="isComplete" label="Complete" />
      <Field.Text name="pathwayId" label="Pathway ID" />
      <Field.Text name="milestoneId" label="Milestone ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Step"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Step"
      />
    </Form>
  );
}

