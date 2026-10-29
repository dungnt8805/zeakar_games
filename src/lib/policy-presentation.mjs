// Presentation only: preserve every word while promoting section titles to headings.
export function preparePolicyHtml(html) {
  let index = 0;
  const sections = [];
  const heading = (_, title) => {
    const id = `policy-section-${++index}`;
    sections.push({ id, title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') });
    return `<h2 id="${id}">${title}</h2>`;
  };
  const content = html.replace(/<p>\s*<strong>([^<]+)<\/strong>\s*<\/p>|<strong>([^<]+)<\/strong>/g, (match, block, inline) => heading(match, block ?? inline));
  return { html: content, sections };
}

export function stripLegacyPresentation(html) {
  return html.replace(/<!-- milaan-policy-[a-z-]+:start -->[\s\S]*?<!-- milaan-policy-[a-z-]+:end -->/g, '');
}
