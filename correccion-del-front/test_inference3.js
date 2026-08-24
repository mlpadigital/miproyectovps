import { AutoModel, AutoProcessor, env } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        
        const dummy = new Float32Array(1 * 3 * 1024 * 1024);
        // RMBG uses pixel_values
        const output = await model({ pixel_values: dummy });
        console.log(Object.keys(output));
    } catch (e) {
        console.error(e);
    }
})();
