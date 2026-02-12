const modelsPath = "https://raw.githubusercontent.com/CristianAbrante/YOLO-in-browser/master/src/yolo/config/model/";
const modelFile = "model.json";

/**
 * Model paths are exported because tf.loadLayersModel expects
 * a URL to the model.json file (not the parsed JSON object).
 */
export default {
  tiny: {
    v1: modelsPath + "v1-tiny/" + modelFile,
    v2: modelsPath + "v2-tiny/" + modelFile,
    v3: modelsPath + "v3-tiny/" + modelFile,
  },
  v3: modelsPath + "v3/" + modelFile
}