import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');
        
        // Let's download a small image to test
        const image = await RawImage.fromURL('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cute-matcha-macaron.jpeg');
        const { pixel_values } = await processor(image);
        const output = await model({ pixel_values });
        console.log(Object.keys(output));
    } catch (e) {
        console.error(e);
    }
})();
