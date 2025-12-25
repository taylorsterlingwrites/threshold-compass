/**
 * UI Component Usage Examples
 *
 * This file demonstrates proper usage of all threshold-compass UI components.
 * Reference these patterns when implementing features.
 */

import { useState } from 'react';
import Button from './Button';
import Card, { CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from './Card';
import Input from './Input';
import Slider from './Slider';
import Badge from './Badge';
import Modal from './Modal';

export function ButtonExamples() {
  return (
    <div className="space-y-4 p-6">
      {/* Primary button */}
      <Button variant="primary" onClick={() => console.log('Clicked')}>
        Log Dose
      </Button>

      {/* Secondary button */}
      <Button variant="secondary">
        Cancel
      </Button>

      {/* Ghost button */}
      <Button variant="ghost">
        Skip
      </Button>

      {/* Sizes */}
      <div className="flex gap-2 items-center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      {/* Full width */}
      <Button fullWidth variant="primary">
        Continue
      </Button>

      {/* Disabled state */}
      <Button disabled>
        Disabled
      </Button>
    </div>
  );
}

export function CardExamples() {
  return (
    <div className="space-y-4 p-6 max-w-2xl">
      {/* Simple card with slots */}
      <Card
        header={<h3 className="text-lg font-semibold text-ivory">Session #12</h3>}
        footer={<span className="text-sm text-muted">2 hours ago</span>}
      >
        <p className="text-ivory">Mild perceptual shifts, enhanced focus.</p>
      </Card>

      {/* Card with subcomponents */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Session</CardTitle>
          <CardDescription>Morning dose at 8:00 AM</CardDescription>
        </CardHeader>
        <CardBody>
          <p>Effects peaked around 10:30 AM. Clear headspace, no anxiety.</p>
        </CardBody>
        <CardFooter>
          <Badge status="mild" />
          <span className="text-sm text-muted ml-auto">Active</span>
        </CardFooter>
      </Card>
    </div>
  );
}

export function InputExamples() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (e.target.value.length < 3) {
      setError('Minimum 3 characters');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-md">
      {/* Basic input */}
      <Input
        label="Session Notes"
        placeholder="Describe your experience..."
        fullWidth
      />

      {/* With helper text */}
      <Input
        label="Dosage (mg)"
        type="number"
        helperText="Enter the amount in milligrams"
        fullWidth
      />

      {/* With error state */}
      <Input
        label="Username"
        value={value}
        onChange={handleChange}
        error={error}
        fullWidth
      />

      {/* Required field */}
      <Input
        label="Email"
        type="email"
        required
        fullWidth
      />

      {/* Disabled */}
      <Input
        label="Disabled Field"
        value="Read only"
        disabled
        fullWidth
      />
    </div>
  );
}

export function SliderExamples() {
  const [intensity, setIntensity] = useState(5);
  const [focus, setFocus] = useState(7.5);

  return (
    <div className="space-y-8 p-6 max-w-md">
      {/* Basic slider */}
      <Slider
        label="Intensity"
        value={intensity}
        onValueChange={setIntensity}
        fullWidth
      />

      {/* Custom range and step */}
      <Slider
        label="Focus Level"
        value={focus}
        onValueChange={setFocus}
        min={0}
        max={10}
        step={0.5}
        fullWidth
      />

      {/* Without value display */}
      <Slider
        label="Mood"
        showValue={false}
        helperText="Drag to rate your mood"
        fullWidth
      />

      {/* With helper text */}
      <Slider
        label="Physical Sensation"
        helperText="0 = None, 10 = Overwhelming"
        fullWidth
      />

      {/* Disabled */}
      <Slider
        label="Previous Session"
        value={6.5}
        disabled
        fullWidth
      />
    </div>
  );
}

export function BadgeExamples() {
  return (
    <div className="space-y-4 p-6">
      {/* Status badges - solid variant */}
      <div className="flex gap-2 flex-wrap">
        <Badge status="clear" />
        <Badge status="mild" />
        <Badge status="moderate" />
        <Badge status="high" />
      </div>

      {/* Outline variant */}
      <div className="flex gap-2 flex-wrap">
        <Badge status="clear" variant="outline" />
        <Badge status="mild" variant="outline" />
        <Badge status="moderate" variant="outline" />
        <Badge status="high" variant="outline" />
      </div>

      {/* Sizes */}
      <div className="flex gap-2 items-center">
        <Badge status="mild" size="sm" />
        <Badge status="mild" size="md" />
        <Badge status="mild" size="lg" />
      </div>

      {/* Custom content */}
      <div className="flex gap-2">
        <Badge status="moderate">Active</Badge>
        <Badge status="high">Peak</Badge>
        <Badge status="clear">Baseline</Badge>
      </div>
    </div>
  );
}

export function ModalExamples() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-4 p-6">
      {/* Simple modal trigger */}
      <Button onClick={() => setOpen(true)}>
        Open Modal
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Session Details"
        description="Review and edit your microdosing session"
      >
        <div className="space-y-4">
          <Input label="Notes" placeholder="Add your observations..." fullWidth />
          <Slider label="Intensity" fullWidth />
        </div>
      </Modal>

      {/* Confirmation modal */}
      <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
        Delete Session
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Session?"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              console.log('Deleted');
              setConfirmOpen(false);
            }}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-muted">
          Are you sure you want to delete this session? All data will be permanently removed.
        </p>
      </Modal>

      {/* Modal with custom close behavior */}
      <Modal
        open={false}
        onClose={() => {}}
        closeOnBackdrop={false}
        closeOnEscape={false}
        title="Important Notice"
      >
        <p>This modal requires explicit confirmation to close.</p>
      </Modal>
    </div>
  );
}

/**
 * Complete Form Example
 * Demonstrates all components working together
 */
export function CompleteFormExample() {
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Session</CardTitle>
          <CardDescription>Record your microdosing experience</CardDescription>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Substance"
              placeholder="e.g., LSD, Psilocybin"
              required
              fullWidth
            />

            <Input
              label="Dosage (mg)"
              type="number"
              step="0.01"
              helperText="Enter the precise amount"
              required
              fullWidth
            />

            <Slider
              label="Intensity"
              value={intensity}
              onValueChange={setIntensity}
              helperText="How strong were the effects?"
              fullWidth
            />

            <Input
              label="Notes"
              placeholder="Describe your experience..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Optional observations"
              fullWidth
            />

            <div className="flex gap-2 items-center">
              <span className="text-label text-ivory">Status:</span>
              <Badge
                status={
                  intensity >= 7 ? 'high' :
                  intensity >= 4 ? 'moderate' :
                  intensity >= 1 ? 'mild' :
                  'clear'
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" fullWidth>
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Save Session
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Session Saved"
        footer={
          <Button onClick={() => setModalOpen(false)}>
            Done
          </Button>
        }
      >
        <p className="text-ivory">
          Your session has been recorded successfully.
        </p>
      </Modal>
    </div>
  );
}
