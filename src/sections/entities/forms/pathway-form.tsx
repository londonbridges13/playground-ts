'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { pathwayAPI } from 'src/lib/api/entities';
import { Form, Field } from 'src/components/hook-form';

import { PathwaySchema } from '../schemas';
import { EntityFormWrapper } from '../components/entity-form-wrapper';

import type { PathwayFormData } from '../schemas';

// ----------------------------------------------------------------------

interface PathwayFormProps {
  userId?: string; // Not required for Pathway
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PathwayForm({ onSuccess, onError }: PathwayFormProps) {
  const methods = useForm({
    resolver: zodResolver(PathwaySchema) as any,
    defaultValues: {
      title: '',
      description: '',
      initLog: '',
      imageUrl: '',
      active: true,
      isPrivate: false,
      isComplete: false,
      artificial: false,
      deadline: null,
      timeEstimate: null,
      pathId: '',
      atlasId: '',
      initialAtlasId: '',
      initialMilestoneId: '',
      initialHorizonId: '',
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
        Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
      ) as any;

      await pathwayAPI.create(cleanData);
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
      <Field.Switch name="artificial" label="AI Generated" />
      <Field.DatePicker name="deadline" label="Deadline" />
      <Field.Text name="timeEstimate" label="Time Estimate (hours)" type="number" />
      <Field.Text name="pathId" label="Path ID" />
      <Field.Text name="atlasId" label="Atlas ID" />
      <Field.Text name="initialAtlasId" label="Initial Atlas ID" />
      <Field.Text name="initialMilestoneId" label="Initial Milestone ID" />
      <Field.Text name="initialHorizonId" label="Initial Horizon ID" />
      <Field.Text name="focusId" label="Focus ID" />
    </>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <EntityFormWrapper
        title="Create Pathway"
        essentialFields={essentialFields}
        optionalFields={optionalFields}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        submitLabel="Create Pathway"
      />
    </Form>
  );
}

