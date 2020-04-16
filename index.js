const Host = 'https://cfw-takehome.developers.workers.dev'
const HTMLURL = Host + '/api/variants'

const strings = {
  title: 'Title has been changed',
  description: 'Description has been changed',
  url: 'New Redirect',
  new_title : 'New Title'
}

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')

  if (contentType.includes('application/json')) {
    
    const body = await response.json()
    
    return body
  } else if (contentType.includes('application/text')) {
    const body = await response.text()
    
    return body
  } else if (contentType.includes('text/html')) {
    const body = await response.text()
    return body
  } else {
    const body = await response.text()
    return body
  }
}

async function fetchGetHtml(url) {
  const init = {
    method: 'Get',
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }

  const response = await fetch(url)
  const respBody = await gatherResponse(response)
  return respBody
}

class ElementHandler {
  constructor(attributeName) {
    this.attributeName = attributeName
  }
  element(element) {
    const id = element.getAttribute('id')
    const strin = strings[id]
    if (strin) {
      element.setInnerContent(strin)
  }
    const href = element.getAttribute(this.attributeName)
    if (href) {
      element.setAttribute(
        this.attributeName,
        href.replace('https://cloudflare.com', 'https://google.com')
      )
    }
    if (element.tagName == 'title') {
      const title_var = strings['new_title']
      if (title_var) {
        element.setInnerContent(title_var)
      }
    }
  }
}
addEventListener('fetch', async event => {
  const { url, method } = event.request

    init = {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    }
    respBody = fetchGetHtml(HTMLURL)

  event.respondWith(
    (async function() {
      const body = await respBody
      one=body.variants[0]
      two=body.variants[1]
      //Choosing one URL out of two with both having a 50% chance.
      var chosenValue = Math.random() < 0.5 ? one : two;
      
      const val = await fetch(chosenValue)
      response = new Response(val.body, val)
      
      response.headers.set("Set-Cookie","cook="+chosenValue+";expires=Expires=Wed, 21 Oct 2020 07:28:00 GMT;")
      
      return new HTMLRewriter().on('*', new ElementHandler()).on('a', new ElementHandler('href')).on('title', new ElementHandler()).transform(response)
    })()
  )

})
