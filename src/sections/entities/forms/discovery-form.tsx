'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { discoveryAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { DiscoverySchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { DiscoveryFormData } from '../schemas';

// ----------------------------------------------------------------------

interface DiscoveryFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function DiscoveryForm({ onSuccess, onError }: DiscoveryFormProps) {
  const methods = useForm<DiscoveryFormData>({
    resolver: zodResolver(DiscoverySchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      pathId: '',
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

      await discoveryAPI.create(cleanData);
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
      <Field.Text name="content" label="Content" multiline rows={6} />
      <Field.Text name="pathId" label="Path ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Discovery"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Discovery"
      />
    </Form>
  );
}

