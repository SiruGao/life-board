const appRoot = document.querySelector('#app')
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')

const modeNotes = [
  ['01', 'DECISION', '厘清选择背后的标准与代价'],
  ['02', 'BELIEF', '把确信放到反例和证据中检验'],
  ['03', 'READING', '拆解文本没有说出的前提'],
  ['04', 'REFLECTION', '辨认欲望、评价与重复模式'],
  ['05', 'AI AUDIT', '决定什么能外包，什么必须保留'],
]

function currentRoute() {
  return location.hash.slice(1) || 'home'
}

function enhanceHome() {
  const hero = appRoot.querySelector('.hero')
  if (!hero || hero.dataset.artDirected === 'true') return
  hero.dataset.artDirected = 'true'
  appRoot.classList.add('editorial-home')

  const main = hero.querySelector('.hero-main')
  const side = hero.querySelector('.hero-side')

  main?.insertAdjacentHTML(
    'afterbegin',
    `<div class="hero-folio" aria-hidden="true">
      <span>VOL. 01</span><span>COGNITIVE AUTONOMY</span><span>2026</span>
    </div>
    <div class="hero-sculpture" aria-hidden="true">
      <i class="orbit orbit-a"></i>
      <i class="orbit orbit-b"></i>
      <i class="orbit orbit-c"></i>
      <i class="orbit-core"></i>
      <span>ASK<br>AGAIN</span>
    </div>`,
  )

  side?.insertAdjacentHTML(
    'afterbegin',
    `<div class="side-index" aria-hidden="true"><span>FIELD NOTE</span><b>01</b></div>`,
  )

  const onboarding = appRoot.querySelector('.onboarding-panel')
  const anchor = onboarding || hero
  anchor.insertAdjacentHTML(
    'afterend',
    `<section class="art-manifesto" aria-labelledby="manifesto-title">
      <div class="manifesto-index" aria-hidden="true">MANIFESTO / 01</div>
      <div class="manifesto-copy">
        <p class="eyebrow">A refusal to outsource judgment</p>
        <h2 id="manifesto-title">工具可以替你加速，<br><em>不能替你承担。</em></h2>
      </div>
      <div class="manifesto-note">
        <p>内核不是更快的答案机器。它是一段被刻意保留下来的停顿：让语言回到证据，让选择回到价值，让责任回到作出判断的人。</p>
        <button class="text-link" data-action="start">从一个真实问题开始 <span>↗</span></button>
      </div>
    </section>
    <section class="method-strip" aria-label="五种审议方式">
      ${modeNotes
        .map(
          ([number, label, note]) => `<article>
            <span>${number}</span>
            <strong>${label}</strong>
            <p>${note}</p>
          </article>`,
        )
        .join('')}
    </section>`,
  )

  appRoot.querySelectorAll('.section').forEach((section, index) => {
    section.classList.add('editorial-section')
    if (!section.querySelector(':scope > .section-number')) {
      section.insertAdjacentHTML(
        'afterbegin',
        `<div class="section-number" aria-hidden="true">${String(index + 2).padStart(2, '0')}</div>`,
      )
    }
  })
}

function enhanceInnerPage() {
  if (currentRoute() === 'home') return
  appRoot.classList.remove('editorial-home')
  const head = appRoot.querySelector('.page-head')
  if (!head || head.dataset.artDirected === 'true') return
  head.dataset.artDirected = 'true'
  head.insertAdjacentHTML(
    'afterbegin',
    `<div class="page-folio" aria-hidden="true"><span>SOCRATIC KERNEL</span><span>${currentRoute().toUpperCase()}</span></div>`,
  )
}

function updateRouteState() {
  document.body.dataset.currentRoute = currentRoute()
  if (currentRoute() === 'home') enhanceHome()
  else enhanceInnerPage()
}

function handlePointer(event) {
  if (motionQuery.matches) return
  const hero = appRoot.querySelector('.hero[data-art-directed="true"]')
  if (!hero) return
  const rect = hero.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
  hero.style.setProperty('--pointer-x', `${(x - 0.5) * 18}px`)
  hero.style.setProperty('--pointer-y', `${(y - 0.5) * 18}px`)
}

new MutationObserver(() => queueMicrotask(updateRouteState)).observe(appRoot, {
  childList: true,
  subtree: true,
})

addEventListener('hashchange', updateRouteState)
addEventListener('pointermove', handlePointer, { passive: true })
updateRouteState()
