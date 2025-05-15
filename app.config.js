// app.config.js
// const ENV = {
//   dev: {
//     API_BASE_URL: "http://localhost:8000/api",
//   },
//   staging: {
//     API_BASE_URL: "https://api.staging.example.com",
//   },
//   prod: {
//     API_BASE_URL: "https://api.example.com",
//   },
// };

// const getEnvVars = () => {
//   const environment = process.env.APP_ENV || "dev"; // 通过 APP_ENV 指定环境
//   return ENV[environment];
// };

// export default ({ config }) => {
//   return {
//     ...config,
//     extra: {
//       ...config.extra,
//       ...getEnvVars(),
//     },
//   };
// };