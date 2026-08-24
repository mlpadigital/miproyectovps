import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
        
        // Dummy 1x3x1024x1024 input
        const dummy = new Float32Array(3 * 1024 * 1024);
        const { output } = await model({ pixel_values: dummy });
        console.log(output);
    } catch (e) {
        console.error(e);
    }
})();
