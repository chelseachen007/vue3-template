// 生产环境配置
const webpack = require('webpack')
const { merge: webpackMerge } = require('webpack-merge')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const uglifyJSPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const compressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()
const webpackBase = require('./webpack.config.base.js')
const { project, pro } = require('./config.js')

const plugins = [
    new MiniCssExtractPlugin({
        filename: 'css/[name].[chunkhash:8].css',
        chunkFilename: 'css/[id].[chunkhash:8].css',
    }),
    new webpack.HashedModuleIdsPlugin(),
    new cleanWebpackPlugin(['./dist/'], {
        root: project,
    }),
    new compressionPlugin({
        filename: '[path].gz[query]',
        test: /(\.js|\.css|\.html|\.png|\.jpg|\.webp|\.svg)(\?.*)?$/,
        cache: true,
        algorithm: 'gzip',
        deleteOriginalAssets: false,
        minRatio: 0.8,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorPluginOptions: {
            preset: [
                'default',
                {
                    discardComments: {
                        removeAll: true,
                    },
                },
            ],
        },
        canPrint: true,
    }),
]

const WATCH_ANALYZER = process.env.WATCH_ANALYZER !== 'false'

if (WATCH_ANALYZER) {
    plugins.push(new BundleAnalyzerPlugin())
}

const webpackProd = {
    mode: 'production',
    stats: {
        colors: true,
    },
    devtool: 'source-map',
    output: {
        filename: 'js/[name].[chunkhash:8].bundle.js',
        publicPath: process.env.PUBLIC_PATH || '/',
    },
    optimization: {
        minimizer: [
            new uglifyJSPlugin({
                sourceMap: true,
                exclude: pro.exclude,
            }),
        ],
        usedExports: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(le|sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                    'less-loader',
                ],
            },
            {
                test: /(\.jsx|\.js|\.ts|\.tsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
        ],
    },
    plugins,
}
let webpackProdOut = webpackMerge(webpackBase, webpackProd)
if (process.env.SMP_OPEN) {
    webpackProdOut = smp.wrap(webpackProdOut)
}
module.exports = webpackProdOut
