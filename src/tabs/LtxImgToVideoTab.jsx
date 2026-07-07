import AsyncForm from '../components/AsyncForm';
import usePolling from '../hooks/usePolling';
import { startLtxImgToVideo } from '../api/pixazo';

const fields = [
  { key: 'prompt', label: 'Prompt', type: 'text', required: true, placeholder: 'Describe the video motion…' },
  { key: 'image_url', label: 'Image URL', type: 'text', required: true, placeholder: 'https://… (public HTTPS, ≤25MB)' },
  { key: 'strength', label: 'Strength', type: 'number', default: 1.0, hint: '0.0–1.0', min: 0, max: 1, step: 0.1 },
  { key: 'seed', label: 'Seed', type: 'number', default: 42 },
  { key: 'aspect', label: 'Aspect Ratio', type: 'select', default: 'auto', options: ['auto', '16:9', '9:16', '1:1', '4:3'] },
  { key: 'width', label: 'Width', type: 'number', default: 1280, min: 256, max: 2048 },
  { key: 'height', label: 'Height', type: 'number', default: 704, min: 256, max: 2048 },
  { key: 'num_frames', label: 'Frames', type: 'number', default: 121, hint: '1–500', min: 1, max: 500 },
  { key: 'frame_rate', label: 'Frame Rate', type: 'number', default: 24, hint: 'FPS', min: 1, max: 60 },
  { key: 'enhance_prompt', label: 'Enhance Prompt', type: 'boolean', default: false },
];

export default function LtxImgToVideoTab({ apiKey }) {
  const polling = usePolling(apiKey);

  return (
    <AsyncForm
      title="LTX Image → Video"
      fields={fields}
      onStart={(form) => startLtxImgToVideo(apiKey, {
        ...form,
        strength: Number(form.strength),
        seed: Number(form.seed),
        width: Number(form.width),
        height: Number(form.height),
        num_frames: Number(form.num_frames),
        frame_rate: Number(form.frame_rate),
      })}
      polling={polling}
    />
  );
}
