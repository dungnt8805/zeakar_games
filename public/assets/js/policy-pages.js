// Add navigation to the untouched text of original English policy documents.
const article = document.querySelector('.legal-legacy-content');
if (article) {
  const headings = [...article.querySelectorAll('strong,h2,h3')].filter(node => {
    if (!node.textContent?.trim() || node.textContent.trim().length > 100) return false;
    return node.tagName !== 'STRONG' || node.parentElement === article || node.parentElement?.tagName === 'DIV' || (node.parentElement?.tagName === 'P' && node.parentElement.textContent.trim() === node.textContent.trim());
  });
  const toc = document.querySelectorAll('[data-legacy-toc]');
  headings.forEach((heading, index) => {
    heading.id = `policy-section-${index + 1}`;
    toc.forEach(container => {
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      container.append(link);
    });
  });
}

for (const link of document.querySelectorAll('.legal-mobile-toc a')) {
  link.addEventListener('click', () => { const menu = link.closest('details'); if (menu) menu.open = false; });
}
const title = document.querySelector('.legal-title')?.textContent?.trim();
if (title) document.title = `${title} | ${/terms/i.test(document.querySelector('.legal-subtitle')?.textContent ?? '') ? 'Terms of service' : 'Privacy policy'} | Milaan Games`;
