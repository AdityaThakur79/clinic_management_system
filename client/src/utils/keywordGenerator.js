// Utility function to generate keywords from title and description
export const generateKeywords = (title, description) => {
  if (!title && !description) return [];
  
  // Combine title and description
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'you', 'your', 'we', 'our', 'us', 'they', 'them', 'their', 'this', 'these', 'those', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'have', 'had', 'having', 'been', 'being', 'get', 'got', 'getting', 'make', 'made', 'making', 'take', 'took', 'taking', 'come', 'came', 'coming', 'go', 'went', 'going', 'see', 'saw', 'seeing', 'know', 'knew', 'knowing', 'think', 'thought', 'thinking', 'say', 'said', 'saying', 'tell', 'told', 'telling', 'give', 'gave', 'giving', 'find', 'found', 'finding', 'use', 'used', 'using', 'work', 'worked', 'working', 'call', 'called', 'calling', 'try', 'tried', 'trying', 'ask', 'asked', 'asking', 'need', 'needed', 'needing', 'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting', 'mean', 'meant', 'meaning', 'keep', 'kept', 'keeping', 'let', 'letting', 'begin', 'began', 'beginning', 'seem', 'seemed', 'seeming', 'help', 'helped', 'helping', 'talk', 'talked', 'talking', 'turn', 'turned', 'turning', 'start', 'started', 'starting', 'show', 'showed', 'showing', 'hear', 'heard', 'hearing', 'play', 'played', 'playing', 'run', 'ran', 'running', 'move', 'moved', 'moving', 'live', 'lived', 'living', 'believe', 'believed', 'believing', 'hold', 'held', 'holding', 'bring', 'brought', 'bringing', 'happen', 'happened', 'happening', 'write', 'wrote', 'writing', 'provide', 'provided', 'providing', 'sit', 'sat', 'sitting', 'stand', 'stood', 'standing', 'lose', 'lost', 'losing', 'pay', 'paid', 'paying', 'meet', 'met', 'meeting', 'include', 'included', 'including', 'continue', 'continued', 'continuing', 'set', 'setting', 'learn', 'learned', 'learning', 'change', 'changed', 'changing', 'lead', 'led', 'leading', 'understand', 'understood', 'understanding', 'watch', 'watched', 'watching', 'follow', 'followed', 'following', 'stop', 'stopped', 'stopping', 'create', 'created', 'creating', 'speak', 'spoke', 'speaking', 'read', 'reading', 'allow', 'allowed', 'allowing', 'add', 'added', 'adding', 'spend', 'spent', 'spending', 'grow', 'grew', 'growing', 'open', 'opened', 'opening', 'walk', 'walked', 'walking', 'win', 'won', 'winning', 'offer', 'offered', 'offering', 'remember', 'remembered', 'remembering', 'love', 'loved', 'loving', 'consider', 'considered', 'considering', 'appear', 'appeared', 'appearing', 'buy', 'bought', 'buying', 'wait', 'waited', 'waiting', 'serve', 'served', 'serving', 'die', 'died', 'dying', 'send', 'sent', 'sending', 'expect', 'expected', 'expecting', 'build', 'built', 'building', 'stay', 'stayed', 'staying', 'fall', 'fell', 'falling', 'cut', 'cutting', 'reach', 'reached', 'reaching', 'kill', 'killed', 'killing', 'remain', 'remained', 'remaining', 'suggest', 'suggested', 'suggesting', 'raise', 'raised', 'raising', 'pass', 'passed', 'passing', 'sell', 'sold', 'selling', 'require', 'required', 'requiring', 'report', 'reported', 'reporting', 'decide', 'decided', 'deciding', 'pull', 'pulled', 'pulling'
  ]);
  
  // Extract words and filter out stop words, numbers, and short words
  const words = text
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) && 
      !/^\d+$/.test(word) // Remove pure numbers
    );
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and get top keywords
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Get top 10 keywords
    .map(([word]) => word);
  
  // Add some domain-specific keywords if they appear in the text
  const domainKeywords = [
    'hearing', 'hearing aid', 'hearing aids', 'audiologist', 'audiologists', 
    'speech therapy', 'speech therapist', 'hearing loss', 'hearing test', 
    'hearing care', 'hearing health', 'tinnitus', 'hearing assessment',
    'hearing evaluation', 'hearing consultation', 'hearing specialist',
    'hearing professional', 'hearing clinic', 'hearing center'
  ];
  
  const foundDomainKeywords = domainKeywords.filter(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  // Combine and deduplicate
  const allKeywords = [...new Set([...sortedWords, ...foundDomainKeywords])];
  
  return allKeywords.slice(0, 8); // Return top 8 keywords
};

// Function to generate SEO title from main title
export const generateSEOTitle = (title) => {
  if (!title) return '';
  
  // Remove common words and limit to 60 characters
  const words = title.toLowerCase().split(' ');
  const importantWords = words.filter(word => 
    word.length > 2 && 
    !['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
  );
  
  let seoTitle = importantWords.join(' ');
  
  // If still too long, truncate intelligently
  if (seoTitle.length > 60) {
    seoTitle = seoTitle.substring(0, 57) + '...';
  }
  
  return seoTitle.charAt(0).toUpperCase() + seoTitle.slice(1);
};

// Function to generate SEO description from excerpt
export const generateSEODescription = (excerpt) => {
  if (!excerpt) return '';
  
  // Clean and limit to 160 characters
  let description = excerpt.trim();
  
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
};
