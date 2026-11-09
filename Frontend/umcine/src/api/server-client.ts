import ky from "ky";
import { env } from "../config/env";

export const serverClient = ky.create({
  baseUrl: `${env.serverApiBaseUrl}/`,
});
