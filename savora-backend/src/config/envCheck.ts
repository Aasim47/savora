export const checkEnvVariables = () => {
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "FRONTEND_URL",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(`\n🚨 FATAL ERROR: Missing required environment variables:`);
    missingVars.forEach((envVar) => console.error(`  - ${envVar}`));
    console.error(`\nPlease provide them in your .env file before starting the server.\n`);
    process.exit(1); // Terminate immediately
  }
};
