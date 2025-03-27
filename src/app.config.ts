import * as dotenv from "dotenv";

dotenv.config();

export const AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  redis_host: process.env.REDIS_HOST || "localhost",
  redis_port: parseInt(process.env.REDIS_PORT || "6379", 10),
  music_brainz_url: process.env.MUSIC_BRAINZ_URL,
  music_brainz_user_agent: process.env.MUSIC_BRAINZ_USER_AGENT,
  jwt_secret: process.env.JWT_SECRET,
};
