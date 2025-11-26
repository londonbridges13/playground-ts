'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { atlasAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { AtlasSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { AtlasFormData } from '../schemas';

// ----------------------------------------------------------------------

interface AtlasFormProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function AtlasForm({ userId, onSuccess, onError }: AtlasFormProps) {
  const methods = useForm({
    resolver: zodResolver(AtlasSchema) as any,
    defaultValues: {
      title: '',
      userId,
      description: '',
      initLog: '',
      imageUrl: '',
      coverImageUrl: '',
      isPrivate: false,
      artificial: false,
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
      // Clean empty strings to undefined
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '')
      ) as any;

      await atlasAPI.create(cleanData);
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
      <Field.Text name="coverImageUrl" label="Cover Image URL" />
      <Field.Switch name="isPrivate" label="Private" />
      <Field.Switch name="artificial" label="AI Generated" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Atlas"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Atlas"
      />
    </Form>
  );
}

