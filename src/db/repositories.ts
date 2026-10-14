import AppDataSource from "./dbconfig";
import { User } from "../models/User.model";
import { Article } from "../models/Article.model";
import { Digest } from "../models/Digests.model";
import { Topic } from "../models/Topic.model";
import { UsePreferences } from "../models/UsePreferences.model";

// Services get repositories through these accessors instead of touching the
// DataSource directly, so data access has one seam that tests can mock.
export const getUserRepository = () => AppDataSource.getRepository(User);
export const getArticleRepository = () => AppDataSource.getRepository(Article);
export const getDigestRepository = () => AppDataSource.getRepository(Digest);
export const getTopicRepository = () => AppDataSource.getRepository(Topic);
export const getPreferencesRepository = () =>
  AppDataSource.getRepository(UsePreferences);
