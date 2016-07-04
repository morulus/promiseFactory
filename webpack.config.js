module.exports = {
    context: __dirname + "/",
    entry: "./src/promiseFactory.js",
    output: {
        path: __dirname + "/",
        filename: "es5.js",
        libraryTarget: 'commonjs2',
        library: 'promiseFactory'
    },

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