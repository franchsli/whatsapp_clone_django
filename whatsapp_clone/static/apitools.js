async function get(url){
    const response = await fetch(url)
    const data = response.json()
    return data
}

export {get}