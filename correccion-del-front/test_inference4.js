import { AutoModel, env } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        
        // Let's create a Tensor explicitly to pass to the model
        const { Tensor } = await import('@huggingface/transformers');
        const dummy = new Tensor('float32', new Float32Array(1 * 3 * 1024 * 1024), [1, 3, 1024, 1024]);
        
        const output = await model({ input: dummy });
        console.log(Object.keys(output));
    } catch (e) {
        console.error(e);
    }
})();
