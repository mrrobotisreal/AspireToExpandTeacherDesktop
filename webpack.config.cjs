const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/renderer.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "renderer.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ttf|otf|eot|svg|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
    ],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "..", "src"),
      "@constants": path.join(__dirname, "..", "src", "constants"),
      "@context": path.join(__dirname, "..", "src", "context"),
      "@views": path.join(__dirname, "..", "src", "views"),
      "@utilities": path.join(__dirname, "..", "src", "utilities"),
      "@locales": path.join(__dirname, "..", "locales"),
    },
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    open: false,
    hot: true,
    port: 9000,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
};
