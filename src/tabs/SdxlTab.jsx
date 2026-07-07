import SyncForm from '../components/SyncForm';
import { generateSDXLImage } from '../api/pixazo';

const fields = [
  { key: 'prompt', label: 'Prompt', type: 'text', required: true, placeholder: 'A cinematic portrait of a futuristic city…' },
  { key: 'negative_prompt', label: 'Negative Prompt', type: 'text', default: '', placeholder: 'Things to avoid…' },
  { key: 'num_steps', label: 'Steps', type: 'number', default: 20, hint: '1–20 (default: 20)', min: 1, max: 20 },
  { key: 'guidance_scale', label: 'Guidance Scale', type: 'number', default: 5, hint: '1–20 (default: 5)', min: 1, max: 20, step: 0.5 },
  { key: 'seed', label: 'Seed', type: 'number', default: '', placeholder: 'Random if empty' },
  { key: 'width', label: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
  { key: 'height', label: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
];

export default function SdxlTab({ apiKey }) {
  return (
    <SyncForm
      title="SDXL 1.0 Image"
      fields={fields}
      onGenerate={(form) => generateSDXLImage(apiKey, {
        ...form,
        seed: form.seed ? Number(form.seed) : undefined,
        num_steps: Number(form.num_steps),
        guidance_scale: Number(form.guidance_scale),
        height: Number(form.height),
        width: Number(form.width),
      })}
    />
  );
}
