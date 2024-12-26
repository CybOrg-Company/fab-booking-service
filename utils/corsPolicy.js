const configureCors = () => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || '*';
    const corsOptions = {
      origin: (origin, callback) => {
        if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // Allow cookies and credentials
    };
    return corsOptions;
  };
  
  export default configureCors;
  