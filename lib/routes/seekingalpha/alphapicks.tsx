import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://seekingalpha.com';

export const route: Route = {
    path: '/alpha-picks',
    categories: ['finance'],
    example: '/seekingalpha/alpha-picks',
    parameters: {},
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['seekingalpha.com/alpha-picks'],
            target: '/alpha-picks',
        },
    ],
    name: 'Alpha Picks',
    maintainers: ['cgjosephlee'],
    handler,
    description: 'Full articles require a subscription, but the summaries available via the API are already quite informative.',
};

async function handler() {
    const pageUrl = `${baseUrl}/alpha-picks`;

    const response = await ofetch(`${baseUrl}/api/v3/service_plans/458/marketplace/articles`, {
        query: {
            lang: 'en',
        },
    });

    const items = response.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: 'Seeking Alpha',
        description: item.attributes.summary?.length
            ? renderToString(
                  <>
                      <h2>Summary</h2>
                      <ul>
                          {item.attributes.summary.map((entry) => (
                              <li>{entry}</li>
                          ))}
                      </ul>
                      <img src={`${item.attributes.gettyImageUrl}?io=getty-c-w630`} alt={item.attributes.title} width="600" />
                  </>
              )
            : '',
    }));

    return {
        title: 'Seeking Alpha - Alpha Picks',
        description: 'Alpha Picks articles from Seeking Alpha',
        link: pageUrl,
        image: 'https://seekingalpha.com/samw/static/images/favicon.svg',
        item: items,
        allowEmpty: true,
        language: 'en-US',
    };
}
