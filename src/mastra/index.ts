import { Mastra } from '@mastra/core/mastra';
import { base44Agent } from './agents/base44-agent';

export const mastra = new Mastra({
  agents: {
    base44Agent,
  },
});

export { base44Agent };

