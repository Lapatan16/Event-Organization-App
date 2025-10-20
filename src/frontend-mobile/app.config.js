export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra, // keep existing fields from app.json
    apiUrl: 'http://192.168.26.206:5202', // override or add your new field
  },
});