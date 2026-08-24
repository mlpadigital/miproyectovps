import { AutoModel, AutoProcessor, env, Tensor } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        const dummy = new Tensor('float32', new Float32Array(1 * 3 * 1024 * 1024), [1, 3, 1024, 1024]);
        const output = await model({ input: dummy });
        console.log(Object.keys(output));
        console.log(output.output.dims);
    } catch (e) {
        console.error(e);
    }
})();
