const LATIN_RUN =
  /[A-Za-z0-9](?:[A-Za-z0-9\s.,!?;:'"()[\]{}\-_/\\@#$%&*+=]*[A-Za-z0-9])?|[A-Za-z0-9]/g

const PRE_BLOCK = /(<pre[\s\S]*?<\/pre>)/gi

function wrapTextNodes(text: string): string {
  return text.replace(LATIN_RUN, (match) => {
    if (!match.trim()) return match
    return `<span class="text-en">${match}</span>`
  })
}

function wrapLatinSegment(html: string): string {
  return html.replace(/>([^<]+)</g, (_, text: string) => {
    return `>${wrapTextNodes(text)}<`
  })
}

export function wrapLatin(html: string): string {
  return html.split(PRE_BLOCK).map((part) => {
    if (/^<pre[\s>]/i.test(part)) return part
    return wrapLatinSegment(part)
  }).join('')
}
