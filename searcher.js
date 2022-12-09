import { readFile } from 'fs/promises'

const tofind = 'recently'

async function main () {
  const data = JSON.parse(await readFile(
    new URL('./data/news-all.json', import.meta.url)
  ))
  const results = []
  data.forEach(el => {
    if(searchFor(tofind, el.title)) {
      results.push(el)
      return 
    }
    if(searchFor(tofind, el.summary)) {
      results.push(el)
      return 
    }
    if(searchFor(tofind, el.body)) {
      results.push(el)
      return
    }
  })
  console.log('found', results.length, 'for', tofind)
}

function searchFor(word, aphrase) {
  return aphrase.toLowerCase().includes(word.toLowerCase())
}

main().then(() => {
  console.log('done')
})
