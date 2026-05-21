export type CuratedQuote = { quote: string; author: string };

export type CuratedSkill = {
  slug: string;
  title: string;
  skillName: string;
  summary: string;
  authors: string[];
  postType: "써본후기" | "공유" | string;
  type: string;
  category: string;
  audience: string[];
  difficulty: string;
  inspiredBy: string;
  keywords: string[];
  links: string[];
  featured: boolean;
  quotes: CuratedQuote[];
  userCount: number;
};
