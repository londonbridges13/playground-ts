'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { storyAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { StorySchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { StoryFormData } from '../schemas';

// ----------------------------------------------------------------------

interface StoryFormProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function StoryForm({ userId, onSuccess, onError }: StoryFormProps) {
  const methods = useForm<StoryFormData>({
    resolver: zodResolver(StorySchema),
    defaultValues: {
      title: '',
      description: '',
      userId: userId || '',
      atlasId: '',
      focusId: '',
      chapters: [],
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
        Object.entries(data).filter(([_, v]) => v !== '' && v !== undefined && !(Array.isArray(v) && v.length === 0))
      ) as any;

      await storyAPI.create(cleanData);
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
      {/* Note: chapters array would need a dynamic field array component */}
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Story"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Story"
      />
    </Form>
  );
}

