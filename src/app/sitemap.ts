import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://pix.tips', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://pix.tips/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://pix.tips/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://pix.tips/privacidade', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://pix.tips/termos', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://pix.tips/cookies', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://pix.tips/help', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]
}
