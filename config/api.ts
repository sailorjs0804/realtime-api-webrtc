// API 配置文件
// 根据环境变量或当前环境自动选择正确的 API 地址

// 获取环境变量中的 API 基础地址，如果没有则使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// 定义 API 配置类型
interface ApiConfig {
  baseUrl: string;
  endpoints: {
    upload: string;
    query: string;
  };
  getUrl: (endpoint: keyof ApiConfig['endpoints']) => string;
}

// 导出 API 配置
export const apiConfig: ApiConfig = {
  // 基础 API 地址
  baseUrl: API_BASE_URL,

  // API 端点
  endpoints: {
    upload: `${API_BASE_URL}/upload`,
    query: `${API_BASE_URL}/query`,
  },

  // 获取完整的 API URL
  getUrl: function(endpoint) {
    return this.endpoints[endpoint];
  }
};

// 用于调试的日志
if (typeof window !== 'undefined') {
  console.log('API Configuration:', {
    baseUrl: apiConfig.baseUrl,
    environment: process.env.NODE_ENV
  });
}