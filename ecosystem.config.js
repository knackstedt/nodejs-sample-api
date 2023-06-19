module.exports = [{
    script: 'dist/server/main.js',
    name: 'nodejs-sample-api',
    exec_mode: 'cluster',
    instances: '1',
    port: 3000
}]
