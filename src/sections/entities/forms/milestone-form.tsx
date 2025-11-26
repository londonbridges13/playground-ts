'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { milestoneAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { MilestoneSchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { MilestoneFormData } from '../schemas';

// ----------------------------------------------------------------------

interface MilestoneFormProps {
  userId?: string; // Not required for Milestone
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function MilestoneForm({ onSuccess, onError }: MilestoneFormProps) {
  const methods = useForm({
    resolver: zodResolver(MilestoneSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      initLog: '',
      imageUrl: '',
      active: true,
      isPrivate: false,
      isComplete: false,
      isEssential: false,
      isAdjacent: false,
      artificial: false,
      horizonId: '',
      atlasId: '',
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

      await milestoneAPI.create(cleanData);
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
      <Field.Switch name="isComplete" label="Complete" />
      <Field.Switch name="isEssential" label="Essential" />
      <Field.Switch name="isAdjacent" label="Adjacent" />
      <Field.Switch name="artificial" label="AI Generated" />
      <Field.Text name="horizonId" label="Horizon ID" />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="pathId" label="Path ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Milestone"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Milestone"
      />
    </Form>
  );
}

