import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5ae56f4677054eb59d7e315c48ebeafb',
  appName: 'Restaurant Employee Dashboard',
  webDir: 'dist',
  server: {
    url: 'https://5ae56f46-7705-4eb5-9d7e-315c48ebeafb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f97316'
    }
  }
};

export default config;
