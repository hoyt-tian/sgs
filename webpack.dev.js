const path = require('path');
const html = require('html-webpack-plugin');
const pkg = require('./package.json')

const config = {
    mode: 'development',
    entry: {},
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js'
    },
    module: {

        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    }
                ],
                
            },
            {
                test: /\.less$/,
                use: [{
                  loader: 'style-loader' // creates style nodes from JS strings
                }, {
                  loader: 'css-loader' // translates CSS into CommonJS
                }, {
                  loader: 'less-loader', options: { javascriptEnabled: true } 
                }]
              },
            {
                test: /\.jsx?$/,
                // include: [path.resolve(__dirname, 'src'), fs.realpathSync(path.resolve(__dirname, './node_modules/react-svg-joystick/src'))],
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]

    },
    plugins: [],
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    },
}

Object.keys(pkg.entry).forEach((k) => {
    config.entry[k] = pkg.entry[k]
    config.plugins.push(new html({
        inject: true,
        title: k,
        template: 'src/template.ejs',
        filename: `${k}.html`,
        chunks: [k]
    }))
})


config.devServer = {
    host: "0.0.0.0", //本机的局域网ip
    open: true //是否运行成功后直接打开页面
}

module.exports = config