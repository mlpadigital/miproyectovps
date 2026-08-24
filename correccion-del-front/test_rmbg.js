import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
env.allowLocalModels = false;
console.log('Loading RMBG...');
try {
  const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
  console.log('Model loaded successfully!');
} catch (e) {
  console.error(e);
}
