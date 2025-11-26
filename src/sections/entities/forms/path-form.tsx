'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { pathAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { PathSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { PathFormData } from '../schemas';

// ----------------------------------------------------------------------

interface PathFormProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PathForm({ userId, onSuccess, onError }: PathFormProps) {
  const methods = useForm({
    resolver: zodResolver(PathSchema) as any,
    defaultValues: {
      title: '',
      userId,
      description: '',
      initLog: '',
      imageUrl: '',
      active: true,
      isPrivate: false,
      isComplete: false,
      isReproduced: false,
      activeAtlasId: '',
      initialAtlasId: '',
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

      await pathAPI.create(cleanData);
      reset();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  const essentialFields = (
    <>
      <Field.Text name="title" label="Title" required />
      <Field.Text name="userId" label="User ID" required disabled />
    </>
  );

  const optionalFields = (
    <>
      <Field.Text name="description" label="Description" multiline rows={3} />
      <Field.Text name="initLog" label="Initial Log" multiline rows={2} />
      <Field.Text name="imageUrl" label="Image URL" />
      <Field.Switch name="active" label="Active" />
      <Field.Switch name="isPrivate" label="Private" />
      <Field.Switch name="isComplete" label="Complete" />
      <Field.Switch name="isReproduced" label="Reproduced" />
      <Field.Text name="activeAtlasId" label="Active Atlas ID" />
      <Field.Text name="initialAtlasId" label="Initial Atlas ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Path"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Path"
      />
    </Form>
  );
}

