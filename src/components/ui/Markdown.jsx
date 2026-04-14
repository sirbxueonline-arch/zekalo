import { useMemo } from 'react'

export default function Markdown({ children }) {
  const html = useMemo(() => renderMarkdown(children || ''), [children])
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}

function renderMarkdown(text) {
  let html = escapeHtml(text)

  // Code blocks ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="md-pre"><code>${code.trim()}</code></pre>`
  )

  // Inline code `
  html = html.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>')
  html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>')

  // Line breaks (double newline = paragraph break, single = <br>)
  html = html.replace(/\n\n/g, '</p><p class="md-p">')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph
  html = `<p class="md-p">${html}</p>`

  // Clean empty paragraphs
  html = html.replace(/<p class="md-p"><\/p>/g, '')
  html = html.replace(/<p class="md-p">(<h[234])/g, '$1')
  html = html.replace(/(<\/h[234]>)<\/p>/g, '$1')
  html = html.replace(/<p class="md-p">(<pre)/g, '$1')
  html = html.replace(/(<\/pre>)<\/p>/g, '$1')
  html = html.replace(/<p class="md-p">(<ul)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')
  html = html.replace(/<p class="md-p">(<ol)/g, '$1')
  html = html.replace(/(<\/ol>)<\/p>/g, '$1')

  return html
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
