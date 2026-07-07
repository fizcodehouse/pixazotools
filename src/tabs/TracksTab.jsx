import AsyncForm from '../components/AsyncForm';
import usePolling from '../hooks/usePolling';
import { startTracksSong } from '../api/pixazo';

const fields = [
  { key: 'prompt', label: 'Prompt', type: 'text', required: true, placeholder: 'Describe the song style, mood, genre…' },
  { key: 'lyrics', label: 'Lyrics', type: 'textarea', default: '', placeholder: 'Paste your lyrics here…\n\nVerse 1:\n...\n\nChorus:\n...' },
  { key: 'duration', label: 'Duration (s)', type: 'number', default: 30, hint: 'In seconds', min: 15, max: 300 },
  { key: 'bpm', label: 'BPM', type: 'number', default: '', placeholder: 'auto' },
  { key: 'key', label: 'Key', type: 'select', default: 'auto', options: ['auto', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] },
  { key: 'time_signature', label: 'Time Signature', type: 'select', default: 'auto', options: ['auto', '4/4', '3/4', '6/8', '2/4', '5/4', '7/8'] },
  { key: 'batch_size', label: 'Batch Size', type: 'number', default: 1, hint: 'Number of variations', min: 1, max: 5 },
  { key: 'thinking', label: 'Thinking Mode', type: 'boolean', default: false },
  { key: 'seed', label: 'Seed', type: 'number', default: -1 },
];

export default function TracksTab({ apiKey }) {
  const polling = usePolling(apiKey);

  return (
    <AsyncForm
      title="Tracks Song Generator"
      fields={fields}
      layout="two-column"
      onStart={(form) => startTracksSong(apiKey, {
        ...form,
        bpm: form.bpm ? Number(form.bpm) : 'auto',
        duration: Number(form.duration),
        batch_size: Number(form.batch_size),
        seed: Number(form.seed),
      })}
      polling={polling}
    />
  );
}
