import { PropsWithChildren, use, useState } from 'react';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input, TextArea } from './ui/Input';
import { CircleX } from 'lucide-react';
import { useCreateTil } from '../helpers/queries';
import { Banner } from './ui/Banner';
import { useToast } from '../helpers/useToast';

const tilSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(8, 'Content must be at least 8 characters'),
});

export function TilDialog({ children }: PropsWithChildren) {
  const { error, mutateAsync } = useCreateTil();
  const [open, setOpen] = useState(false);
  const createToast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(tilSchema),
  });

  const submit = handleSubmit(async (data) => {
    try {
      await mutateAsync(data);
      reset();
      setOpen(false);
      createToast('TIL created');
    } catch (error) {
      console.log('error', error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Today I Learned</Dialog.Title>
          <Dialog.Description>
            Write a new TIL, and share it with the community.
          </Dialog.Description>
        </Dialog.Header>
        {error && <Banner variant="error">{error.message}</Banner>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <Input
              {...register('title')}
              placeholder="Title"
              aria-required="true"
              aria-invalid={!!errors?.title?.message}
              aria-describedby={errors?.title?.message && 'title-error'}
            />
            {errors?.title?.message && (
              <p className="error" role="alert" id="title-error">
                <CircleX aria-hidden /> {errors?.title?.message}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="content">Content</label>
            <TextArea
              {...register('content')}
              placeholder="Content"
              aria-required="true"
              aria-invalid={!!errors?.content?.message}
              aria-describedby={errors?.content?.message && 'content-error'}
            />
            {errors?.content?.message && (
              <p className="error" role="alert" id="content-error">
                <CircleX aria-hidden /> {errors?.content?.message}
              </p>
            )}
          </div>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary">Close</Button>
            </Dialog.Close>
            <Button type="submit" variant="accent">
              Save
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
