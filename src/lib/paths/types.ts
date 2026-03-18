export interface LearningPath {
  slug: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  signSlugs: string[];
  featured: boolean;
}
