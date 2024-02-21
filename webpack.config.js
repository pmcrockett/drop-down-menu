import path from "path";
const __dirname = import.meta.dirname;

export default {
  entry: "./src/script.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
  },
};
