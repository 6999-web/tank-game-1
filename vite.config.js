import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0', // 允许局域网内其他设备访问（包括手机测试）
        port: 33333,      // 统一使用用户习惯的 33333 端口
        open: true        // 启动后自动打开浏览器
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
});
