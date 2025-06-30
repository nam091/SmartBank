// Kiểm tra môi trường thực thi
const isServerSide = typeof window === 'undefined';

// Import dotenv cho server-side
if (isServerSide) {
  // Không thể dùng require trong ESM, phải dùng import.meta
  // Để hỗ trợ biến môi trường, chúng ta sẽ dùng giá trị mặc định
  console.log('Running in server environment, using process.env');
}

// Hàm để lấy biến môi trường phù hợp với môi trường thực thi
function getEnvVariable(name: string, defaultValue: string): string {
  if (isServerSide) {
    // Trong Node.js (server-side)
    return process.env[name] || defaultValue;
  } else {
    // Trong trình duyệt (Vite)
    return (import.meta.env as any)[name] || defaultValue;
  }
}

export const config = {
  mongodb: {
    host: getEnvVariable('VITE_MONGODB_HOST', 'localhost'),
    port: getEnvVariable('VITE_MONGODB_PORT', '27017'),
    username: getEnvVariable('VITE_MONGODB_USERNAME', ''),
    password: getEnvVariable('VITE_MONGODB_PASSWORD', ''),
    database: getEnvVariable('VITE_MONGODB_DATABASE', 'smartbank-a'),
  },
  app: {
    port: getEnvVariable('VITE_PORT', '3000'),
    environment: isServerSide ? (process.env.NODE_ENV || 'development') : (import.meta.env.MODE || 'development'),
  }
}; 