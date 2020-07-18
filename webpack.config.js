const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        main: path.resolve(__dirname, 'src/app.ts'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "[name]-bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};