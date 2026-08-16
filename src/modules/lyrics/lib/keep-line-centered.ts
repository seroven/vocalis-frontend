export function keepLineCentered(
  scroller: HTMLElement | null,
  line: HTMLElement | null,
) {
  if (!scroller || !line) {
    return
  }

  const view = scroller.getBoundingClientRect()
  const target = line.getBoundingClientRect()
  const delta = target.top + target.height / 2 - (view.top + view.height / 2)

  scroller.scrollTop += delta
}
