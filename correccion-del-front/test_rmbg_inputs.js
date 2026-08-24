import { AutoModel, env } from '@huggingface/transformers';
env.allowLocalModels = false;

(async () => {
    try {
        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', { quantized: true });
        console.log(model.session.inputNames);
        console.log(model.session.outputNames);
    } catch (e) {
        console.error(e);
    }
})();
