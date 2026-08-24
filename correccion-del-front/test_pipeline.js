import { pipeline, env } from '@huggingface/transformers';
env.allowLocalModels = false;
console.log('Loading pipeline...');
try {
  const remover = await pipeline('image-segmentation', 'briaai/RMBG-1.4', { quantized: true });
  console.log('Pipeline loaded successfully!');
} catch (e) {
  console.error(e);
}
