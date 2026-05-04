import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xandeflix.app',
  appName: 'Xandeflix',
  webDir: 'dist',
  backgroundColor: '#050505',

  server: {
    url: 'http://10.115.27.59:5173',
    androidScheme: 'http',
    cleartext: true,
  },

  plugins: {
    StatusBar: {
      backgroundColor: '#050505',
      style: 'DARK',
    },
  },
};

export default config;