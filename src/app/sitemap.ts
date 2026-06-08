import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: 'https://pix.tips', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://pix.tips/register', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://pix.tips/login', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://pix.tips/examples', lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://pix.tips/blog', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://pix.tips/help', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://pix.tips/developers', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://pix.tips/sobre', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://pix.tips/contato', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://pix.tips/status', lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: 'https://pix.tips/privacidade', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://pix.tips/termos', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://pix.tips/cookies', lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
}
