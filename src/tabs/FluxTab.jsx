import SyncForm from '../components/SyncForm';
import { generateFluxImage } from '../api/pixazo';

const fields = [
  { key: 'prompt', label: 'Prompt', type: 'text', required: true, placeholder: 'A cozy cabin in the snowy mountains…' },
  { key: 'num_steps', label: 'Steps', type: 'number', default: 4, hint: '1–50 (default: 4)', min: 1, max: 50 },
  { key: 'seed', label: 'Seed', type: 'number', default: '', placeholder: 'Random if empty' },
  { key: 'width', label: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
  { key: 'height', label: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
];

export default function FluxTab({ apiKey }) {
  return (
    <SyncForm
      title="Flux Image"
      fields={fields}
      onGenerate={(form) => generateFluxImage(apiKey, {
        ...form,
        seed: form.seed ? Number(form.seed) : undefined,
        num_steps: Number(form.num_steps),
        height: Number(form.height),
        width: Number(form.width),
      })}
    />
  );
}
