const conf={
    googleClientID:String(process.env.GOOGLE_CLIENT_ID),
    googleAPIKey:String(process.env.GOOGLE_API_KEY),
    googleClientSecret:String(process.env.GOOGLE_CLIENT_SECRET),
    geminiAPIKey:String(process.env.GENAI_API_KEY),
    stripePublicAPIKey:String(process.env.STRIPE_PUBLIC_API_KEY),
    stripeSecretAPIKey:String(process.env.STRIPE_SECRET_API_KEY),
    razorpayKeyID:String(process.env.RAZORPAY_KEY_ID),
    razorpayKeySecret:String(process.env.RAZORPAY_KEY_SECRET),
    serverPort:String(process.env.PORT),
    mongoDBURI:String(process.env.MONGODB_URI),
    PORT: process.env.PORT,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_CLOUD_API_KEY: process.env.CLOUDINARY_CLOUD_API_KEY,
    CLOUDINARY_CLOUD_SECRET_KEY: process.env.CLOUDINARY_CLOUD_SECRET_KEY,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL
};

export default conf;