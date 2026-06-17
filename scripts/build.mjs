import { cp, mkdir, rm } from 'node:fs/promises'

const files = ['index.html', 'app.js', 'styles.css', 'icon.svg', 'manifest.webmanifest', 'sw.js']

await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
await Promise.all(files.map((file) => cp(file, `dist/${file}`)))

console.log(`Built Socratic Kernel with ${files.length} static assets.`)
