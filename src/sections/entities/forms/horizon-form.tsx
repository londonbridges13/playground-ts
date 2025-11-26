'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { horizonAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { HorizonSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { HorizonFormData } from '../schemas';

// ----------------------------------------------------------------------

interface HorizonFormProps {
  userId?: string; // Not required for Horizon
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function HorizonForm({ onSuccess, onError }: HorizonFormProps) {
  const methods = useForm({
    resolver: zodResolver(HorizonSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      initLog: '',
      imageUrl: '',
      active: true,
      isPrivate: false,
      artificial: false,
      atlasId: '',
      pathId: '',
      initialAtlasId: '',
      initialPathId: '',
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

      await horizonAPI.create(cleanData);
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
      <Field.Text name="initLog" label="Initial Log" multiline rows={2} />
      <Field.Text name="imageUrl" label="Image URL" />
      <Field.Switch name="active" label="Active" />
      <Field.Switch name="isPrivate" label="Private" />
      <Field.Switch name="artificial" label="AI Generated" />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="pathId" label="Path ID" />
      <Field.Text name="initialAtlasId" label="Initial Atlas ID" />
      <Field.Text name="initialPathId" label="Initial Path ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Horizon"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Horizon"
      />
    </Form>
  );
}

