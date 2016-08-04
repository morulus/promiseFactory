var webpack = require('webpack');
module.exports = {
    context: __dirname + "/",
    entry: "./src/promiseFactory.js",
    output: {
        path: __dirname + "/",
        filename: "es5.js",
        libraryTarget: 'commonjs2',
        library: 'promiseFactory'
    },
    plugins: [
        new webpack.DefinePlugin({
            '"PROMISE_FACTORY_ES6"': "false"
        })
    ],
    module: {
    	loaders: [
	    	{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015'],
                    plugins: ["add-module-exports"]
                }
            }
	    ]
    }
    
}