import { htmlTemplate } from "@src/htmlViewBuilder"

export default htmlTemplate(() => root => {
  root.div(el => el.config.innerHTML("<h3>Hello!!!</h3>"))
})